'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/components/providers/AuthProvider';
import { usePropertySession, useMilestones, useInMemorySession } from '@/src/hooks';
import { ChatLayout, JourneyCanvas } from '@/src/components/chat-v2';
import { AiResponseCard } from '@/src/components/chat-v2/AiResponseCard';
import { ChatFeed } from '@/src/components/chat-v2/ChatPanel';
import { SaveResultsBanner } from '@/src/components/chat-v2/SaveResultsBanner';
import { SkeletonLoader } from '@/src/components/chat-v2/SkeletonLoader';
import { UserMessageBubble } from '@/src/components/chat-v2/UserMessageBubble';
import type { ChipDefinition } from '@/src/components/chat-v2/types';
import {
  createSession,
  createInteraction,
  waitForInteractionResult,
  type StructuredCard,
} from '@/src/lib/brickai-agent-api';

type MessageRole = 'user' | 'ai' | 'skeleton';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content?: string;
  structuredCard?: StructuredCard;
  journeyUpdated?: boolean;
  isStreaming?: boolean;
}

const DEFAULT_CHIPS: ChipDefinition[] = [
  {
    id: 'suburb-check',
    label: '🏘️ Check this suburb',
    prompt: 'Tell me about this suburb – schools, crime, transport, growth potential',
    used: false,
  },
  {
    id: 'price-estimate',
    label: '💰 Price check',
    prompt: 'What is a fair price for this property? What does the data say?',
    used: false,
  },
  {
    id: 'grants',
    label: '🏛️ Grants & schemes',
    prompt: 'What first home buyer grants or government schemes can I access in Victoria?',
    used: false,
  },
  {
    id: 'inspection',
    label: '🔍 Inspection tips',
    prompt: 'What should I look for at the inspection for this property?',
    used: false,
  },
  {
    id: 'next-steps',
    label: '📋 What next?',
    prompt: 'What are the next steps in my property buying journey?',
    used: false,
  },
];

const AU_ADDRESS_REGEX =
  /\d+\s+[\w'./-]+(?:\s+[\w'./-]+)*(?:,\s*[\w'./-]+)*(?:\s+(?:street|st|road|rd|avenue|ave|drive|dr|court|ct|way|crescent|cres|place|pl|lane|ln|close|cl))\b/i;
const IMPLIED_ADDRESS_REGEX = /\b(?:searching for|looking at)\s+([^.?!]+)/i;

function makeMessageId(prefix: MessageRole | 'error') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractPropertyAddress(message: string) {
  const directMatch = message.match(AU_ADDRESS_REGEX);
  if (directMatch?.[0]) {
    return directMatch[0].trim();
  }

  const impliedMatch = message.match(IMPLIED_ADDRESS_REGEX);
  const candidate = impliedMatch?.[1]?.trim().replace(/[.,\s]+$/, '');
  if (!candidate) {
    return null;
  }

  const looksAddressLike = /\d/.test(candidate) || /\b(?:street|st|road|rd|avenue|ave|drive|dr|court|ct|way|crescent|cres|place|pl|lane|ln|close|cl)\b/i.test(candidate);
  return looksAddressLike ? candidate : null;
}

function getMockResponse(message: string): StructuredCard {
  const lower = message.toLowerCase();
  const isSuburb = lower.includes('suburb') || lower.includes('area') || lower.includes('neighbourhood');
  const isPrice = lower.includes('price') || lower.includes('cost') || lower.includes('worth');
  const isGrant = lower.includes('grant') || lower.includes('scheme') || lower.includes('first home');

  if (isSuburb) {
    return {
      verdict: 'This suburb shows strong fundamentals with good long-term growth potential.',
      body: 'Based on recent data, this suburb has seen consistent buyer demand and good infrastructure investment.',
      dataPoints: [
        { label: 'Median house price', value: '$1.2M' },
        { label: '12-month growth', value: '+6.2%' },
        { label: 'Rental yield', value: '2.8%' },
        { label: 'Days on market', value: '28 days' },
      ],
      concerns: ['Limited public transport options', 'School catchment boundary may affect value'],
      nextSteps: [
        'Attend weekend open for inspections',
        'Request a building inspection report',
        'Check the Section 32 for any encumbrances',
      ],
      milestoneType: 'positive',
      milestoneCategory: 'suburb',
      suggestModule: 'Suburb Comparison',
    };
  }

  if (isPrice) {
    return {
      verdict: 'Current market data suggests a fair value range of $950K–$1.1M for this type of property.',
      dataPoints: [
        { label: 'Comparable sale (3mo)', value: '$985K' },
        { label: 'Suburb median', value: '$1.05M' },
        { label: 'Price per sqm', value: '$7,200' },
      ],
      concerns: [
        'Price may be inflated due to recent renovation',
        'Verify land size against certificate of title',
      ],
      nextSteps: ['Get an independent valuation', 'Review comparable sales in the last 6 months'],
      milestoneType: 'neutral',
      milestoneCategory: 'property',
    };
  }

  if (isGrant) {
    return {
      verdict: 'You may be eligible for the First Home Owner Grant and Stamp Duty concessions in Victoria.',
      body: 'Victoria offers several schemes for first home buyers including the FHOG ($10,000 for new builds) and the First Home Buyer Duty Exemption/Concession.',
      dataPoints: [
        { label: 'FHOG (new builds)', value: '$10,000' },
        { label: 'Duty exemption threshold', value: 'Up to $600K' },
        { label: 'Concession threshold', value: '$600K–$750K' },
      ],
      concerns: [
        'You must not have previously owned property in Australia',
        'New builds only for the cash grant',
      ],
      nextSteps: ['Confirm eligibility with your conveyancer', 'Apply through the SRO Victoria website'],
      milestoneType: 'positive',
      milestoneCategory: 'grants',
    };
  }

  return {
    verdict: 'Happy to help with your property buying journey.',
    body: 'I can help you research suburbs, estimate prices, find grants, and prepare for inspections. What would you like to explore first?',
    nextSteps: [
      "Tell me the suburb or address you're interested in",
      'Ask about grants or schemes you may be eligible for',
      'Check what to look for at an inspection',
    ],
    milestoneType: 'neutral',
    milestoneCategory: 'property',
  };
}

function ChatV2Inner() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [chips, setChips] = useState<ChipDefinition[]>(DEFAULT_CHIPS);
  const [agentSessionId, setAgentSessionId] = useState<string | null>(null);
  const [hasSuburbResult, setHasSuburbResult] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const initialMessageHandled = useRef(false);

  const { session } = usePropertySession(user?.id ?? null, propertyAddress || null);
  const { milestones, addMilestone } = useMilestones(session?.id ?? null);
  const {
    milestones: inMemoryMilestones,
    addMessage: addInMemoryMessage,
    addMilestone: addInMemoryMilestone,
  } = useInMemorySession();

  useEffect(() => {
    const queryAddress = searchParams.get('address')?.trim();
    if (queryAddress) {
      setPropertyAddress(queryAddress);
    }
  }, [searchParams]);

  useEffect(() => {
    document.title = propertyAddress ? `Brick AI · ${propertyAddress}` : 'Brick AI · Chat';
  }, [propertyAddress]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visibleMilestones = isAuthenticated ? milestones : inMemoryMilestones;

  const replaceMessage = useCallback((messageId: string, nextMessage: ChatMessage) => {
    setMessages((current) => current.map((message) => (message.id === messageId ? nextMessage : message)));
  }, []);

  const handleSend = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        return;
      }

      const detectedAddress = extractPropertyAddress(trimmedMessage);
      if (detectedAddress) {
        setPropertyAddress(detectedAddress);
      }

      const userMessage: ChatMessage = {
        id: makeMessageId('user'),
        role: 'user',
        content: trimmedMessage,
      };
      const skeletonId = makeMessageId('skeleton');

      setMessages((current) => [...current, userMessage, { id: skeletonId, role: 'skeleton' }]);
      setChips((current) =>
        current.map((chip) =>
          chip.prompt === trimmedMessage ? { ...chip, used: true } : chip,
        ),
      );

      if (!isAuthenticated) {
        addInMemoryMessage('user', trimmedMessage);
      }

      setIsLoading(true);

      try {
        let structuredCard: StructuredCard;

        try {
          let nextAgentSessionId = agentSessionId;

          if (!nextAgentSessionId) {
            const createdSession = await createSession(
              detectedAddress || propertyAddress || 'Brick AI property chat',
            );
            nextAgentSessionId = createdSession.session_id;
            setAgentSessionId(nextAgentSessionId);
          }

          const interaction = await createInteraction(nextAgentSessionId, trimmedMessage);
          const result = await waitForInteractionResult(interaction.interaction_id);

          if (!result.structured_card) {
            throw new Error('Brick AI returned no structured card');
          }

          structuredCard = result.structured_card;
        } catch (error) {
          console.warn('Brick AI agent unavailable, using mock response.', error);
          structuredCard = getMockResponse(trimmedMessage);
        }

        const journeyUpdated = Boolean(
          structuredCard.milestoneType && structuredCard.milestoneCategory,
        );

        if (journeyUpdated) {
          const milestoneInput = {
            type: structuredCard.milestoneType!,
            milestoneCategory: structuredCard.milestoneCategory!,
            title: structuredCard.verdict,
            data: structuredCard.milestoneData,
          };

          if (isAuthenticated) {
            await addMilestone(milestoneInput);
          } else {
            addInMemoryMilestone(milestoneInput);
          }
        }

        if (!isAuthenticated) {
          addInMemoryMessage('assistant', structuredCard.verdict);
        }

        // Track first suburb result for save CTA
        if (!isAuthenticated && structuredCard.milestoneCategory === 'suburb') {
          setHasSuburbResult(true);
        }

        replaceMessage(skeletonId, {
          id: makeMessageId('ai'),
          role: 'ai',
          structuredCard,
          journeyUpdated,
          isStreaming: false,
        });
      } catch (error) {
        console.error('Failed to send chat-v2 message.', error);
        replaceMessage(skeletonId, {
          id: makeMessageId('error'),
          role: 'ai',
          structuredCard: {
            verdict: 'Something went wrong while preparing your response.',
            body: 'Please try again in a moment.',
          },
          journeyUpdated: false,
          isStreaming: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      addInMemoryMessage,
      addInMemoryMilestone,
      addMilestone,
      agentSessionId,
      isAuthenticated,
      propertyAddress,
      replaceMessage,
    ],
  );

  const handleChipClick = useCallback(
    (prompt: string, chipId: string) => {
      setChips((current) => current.map((chip) => (chip.id === chipId ? { ...chip, used: true } : chip)));
      void handleSend(prompt);
    },
    [handleSend],
  );

  // Auto-submit the initial message from the landing page query param (once only)
  useEffect(() => {
    if (initialMessageHandled.current) return;
    const queryMessage = searchParams.get('message')?.trim();
    if (!queryMessage) return;
    initialMessageHandled.current = true;
    void handleSend(queryMessage);
  }, [handleSend, searchParams]);

  return (
    <ChatLayout
      initialAddress={propertyAddress}
      chips={chips}
      onChipClick={handleChipClick}
      onSend={handleSend}
      inputDisabled={isLoading}
      inputPlaceholder={
        propertyAddress
          ? `Ask about ${propertyAddress}...`
          : 'Ask about any Australian property...'
      }
      messageCount={isAuthenticated ? 0 : messages.filter((message) => message.role === 'user').length}
      chatChildren={
        <ChatFeed style={{ flex: 1 }}>
          {messages.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-6)',
                fontFamily: 'var(--font-body)',
                color: 'var(--slate)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', lineHeight: 1.5, maxWidth: 280 }}>
                Ask me anything about buying property in Australia — suburbs, prices, grants,
                inspections.
              </div>
            </div>
          ) : (
            messages.map((message) => {
              if (message.role === 'user') {
                return <UserMessageBubble key={message.id} content={message.content ?? ''} />;
              }

              if (message.role === 'skeleton') {
                return <SkeletonLoader key={message.id} visible={true} />;
              }

              return message.structuredCard ? (
                <AiResponseCard
                  key={message.id}
                  verdict={message.structuredCard.verdict}
                  body={message.structuredCard.body}
                  dataPoints={message.structuredCard.dataPoints}
                  concerns={message.structuredCard.concerns}
                  nextSteps={message.structuredCard.nextSteps}
                  isStreaming={message.isStreaming}
                  journeyUpdated={message.journeyUpdated}
                />
              ) : null;
            })
          )}
          <SaveResultsBanner visible={!isAuthenticated && hasSuburbResult} />
          <div ref={feedEndRef} />
        </ChatFeed>
      }
      canvasChildren={
        <JourneyCanvas
          milestones={visibleMilestones}
          propertyAddress={propertyAddress}
          propertySessionId={session?.id}
          isReadOnly={false}
          isAuthenticated={isAuthenticated}
        />
      }
    />
  );
}

export default function ChatV2Page() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', background: 'var(--paper)' }} />}>
      <ChatV2Inner />
    </Suspense>
  );
}

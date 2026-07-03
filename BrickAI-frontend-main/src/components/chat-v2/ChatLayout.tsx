'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useAuth } from '@/src/components/providers/AuthProvider';
import { useInMemorySession } from '@/src/hooks';
import { AuthGate } from './AuthGate';
import { ChatV2Context } from './ChatV2Context';
import { ChatFeed, ChatPanel } from './ChatPanel';
import { ChipsRow } from './ChipsRow';
import { InputBar } from './InputBar';
import { MobileTabSwitcher } from './MobileTabSwitcher';
import { ResizeHandle } from './ResizeHandle';
import { Topbar } from './Topbar';
import type { ChatV2Props, ChipDefinition } from './types';

interface ChatLayoutProps extends ChatV2Props {
  userName?: string;
  userInitials?: string;
  chips?: ChipDefinition[];
  onChipClick?: (prompt: string, chipId: string) => void;
  onSend?: (message: string) => void;
  chatChildren?: ReactNode;
  canvasChildren?: ReactNode;
  inputDisabled?: boolean;
  inputPlaceholder?: string;
  messageCount?: number;
  showLoginPrompt?: boolean;
  onLoginPromptDismiss?: () => void;
}

const defaultCanvasStyle: CSSProperties = {
  background: 'var(--limestone)',
};

function clampWidth(width: number, containerWidth: number) {
  const minWidth = 280;
  const maxWidth = Math.max(minWidth, containerWidth * 0.7);
  return Math.min(Math.max(width, minWidth), maxWidth);
}

function getUserInitials(name: string | undefined, email: string | undefined) {
  if (name?.trim()) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  return email?.slice(0, 2).toUpperCase() || undefined;
}

export function ChatLayout({
  initialMessage,
  initialAddress,
  userName,
  userInitials,
  chips = [],
  onChipClick,
  onSend,
  chatChildren,
  canvasChildren,
  inputDisabled = false,
  inputPlaceholder,
  messageCount,
  showLoginPrompt,
  onLoginPromptDismiss,
}: ChatLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const { addMessage, userTurnCount } = useInMemorySession();
  const panelsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [chatWidth, setChatWidth] = useState(420);
  const [activeTab, setActiveTab] = useState<'chat' | 'journey'>('chat');
  const [journeyHasUpdate, setJourneyHasUpdate] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState(initialAddress ?? '');
  const [loginPromptVisible, setLoginPromptVisible] = useState(showLoginPrompt ?? false);

  useEffect(() => {
    if (typeof showLoginPrompt === 'boolean') {
      setLoginPromptVisible(showLoginPrompt);
    }
  }, [showLoginPrompt]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoginPromptVisible(false);
    }
  }, [isAuthenticated]);

  const resolvedUserName = useMemo(() => {
    if (userName) {
      return userName;
    }

    const metadataName =
      (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
      (typeof user?.user_metadata?.name === 'string' && user.user_metadata.name) ||
      [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
        .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
        .join(' ');

    return metadataName || user?.email || undefined;
  }, [user?.email, user?.user_metadata, userName]);

  const resolvedUserInitials = useMemo(
    () => userInitials || getUserInitials(resolvedUserName, user?.email),
    [resolvedUserName, user?.email, userInitials],
  );

  const resolvedMessageCount = isAuthenticated ? 0 : (messageCount ?? userTurnCount);

  // Auto-show login prompt when guest hits the 3-question limit
  useEffect(() => {
    if (!isAuthenticated && resolvedMessageCount >= 3) {
      setLoginPromptVisible(true);
    }
  }, [isAuthenticated, resolvedMessageCount]);

  const applyChatWidth = useCallback((nextWidth: number) => {
    const containerWidth = panelsRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const clamped = clampWidth(nextWidth, containerWidth);

    setChatWidth(clamped);
    panelsRef.current?.style.setProperty('--chat-w', `${clamped}px`);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);

      if (!nextIsMobile) {
        const containerWidth = panelsRef.current?.getBoundingClientRect().width ?? window.innerWidth;
        applyChatWidth(chatWidth || containerWidth * 0.42);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [applyChatWidth, chatWidth]);

  useEffect(() => {
    if (!isMobile || activeTab !== 'journey') return;
    setJourneyHasUpdate(false);
  }, [activeTab, isMobile]);

  const contextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      journeyHasUpdate,
      setJourneyHasUpdate,
      propertyAddress,
      setPropertyAddress,
    }),
    [activeTab, journeyHasUpdate, propertyAddress],
  );

  const handleChipSelection = useCallback(
    (prompt: string, chipId: string) => {
      onChipClick?.(prompt, chipId);
    },
    [onChipClick],
  );

  const handleSend = useCallback(
    (message: string) => {
      if (!isAuthenticated) {
        addMessage('user', message);
      }

      onSend?.(message);
    },
    [addMessage, isAuthenticated, onSend],
  );

  const handleLoginPromptDismiss = useCallback(() => {
    setLoginPromptVisible(false);
    onLoginPromptDismiss?.();
  }, [onLoginPromptDismiss]);

  const chatShell = (
    <ChatPanel
      style={
        isMobile
          ? undefined
          : {
              width: 'var(--chat-w)',
              flex: '0 0 var(--chat-w)',
            }
      }
    >
      <AuthGate
        isAuthenticated={isAuthenticated}
        messageCount={resolvedMessageCount}
        showLoginPrompt={loginPromptVisible && !isAuthenticated}
        onLoginPromptDismiss={handleLoginPromptDismiss}
        onSendMessage={handleSend}
        chipsRow={<ChipsRow chips={chips} onChipClick={handleChipSelection} disabled={inputDisabled} />}
        inputBar={
          <InputBar
            onSend={handleSend}
            disabled={inputDisabled}
            initialValue={initialMessage}
            placeholder={inputPlaceholder}
          />
        }
      >
        {chatChildren ?? (
          <ChatFeed>
            <div
              className="flex h-full items-center justify-center px-6 text-center"
              style={{ color: 'var(--slate)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
            >
              Chat content plugs in here.
            </div>
          </ChatFeed>
        )}
      </AuthGate>
    </ChatPanel>
  );

  const canvasShell = (
    <div className="canvas-wrap flex min-h-0 flex-1 overflow-hidden" style={defaultCanvasStyle}>
      {canvasChildren ?? (
        <div className="flex h-full w-full items-center justify-center px-6 text-center">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              Journey canvas
            </div>
            <div
              style={{
                marginTop: 'var(--space-1)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--slate)',
              }}
            >
              {propertyAddress || 'Property milestones and canvas content appear here.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ChatV2Context.Provider value={contextValue}>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden" style={{ background: 'var(--paper)' }}>
        <Topbar
          isAuthenticated={isAuthenticated}
          user={user}
          userName={resolvedUserName}
          userInitials={resolvedUserInitials}
        />

        {isMobile ? (
          <>
            <MobileTabSwitcher
              activeTab={activeTab}
              onTabChange={setActiveTab}
              journeyHasUpdate={journeyHasUpdate}
            />
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {activeTab === 'chat' ? chatShell : canvasShell}
            </div>
          </>
        ) : (
          <div
            ref={panelsRef}
            className="panels flex min-h-0 flex-1 overflow-hidden"
            style={{ ['--chat-w' as string]: `${chatWidth}px` }}
          >
            {chatShell}
            <ResizeHandle onResize={applyChatWidth} panelsRef={panelsRef} />
            {canvasShell}
          </div>
        )}
      </div>
    </ChatV2Context.Provider>
  );
}

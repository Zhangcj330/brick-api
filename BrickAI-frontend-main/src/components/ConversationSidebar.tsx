import { Plus, MessageSquare, Trash2, MoreVertical, PanelLeftClose } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const logoImage = "/brick-ai-logo.png";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onBack: () => void;
  onToggleSidebar?: () => void;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onBack,
  onToggleSidebar,
}: ConversationSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-700 transition hover:text-gray-900"
          >
            <img src={logoImage} alt="Brick AI" className="h-8 w-auto" />
          </button>
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          onClick={onNewConversation}
          className="h-10 w-full rounded-xl bg-gray-900 text-white transition hover:bg-gray-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          New search
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative rounded-xl transition-colors ${
                currentConversationId === conversation.id
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className="flex w-full items-start gap-3 p-3 text-left overflow-hidden"
              >
                <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="mb-1 truncate text-sm text-gray-900">
                    {conversation.title}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {conversation.lastMessage}
                  </div>
                </div>
              </button>

              {/* More Options */}
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 rounded-lg bg-gray-100 p-0 hover:bg-gray-200"
                    >
                      <MoreVertical className="h-3 w-3 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-gray-200 bg-white text-gray-900"
                  >
                    <DropdownMenuItem
                      onClick={() => onDeleteConversation(conversation.id)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

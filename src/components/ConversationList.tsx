import { Conversation } from '@/lib/indexedDb';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-purple/10 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-purple" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation by contacting a vendor
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => (
        <button
          key={conv.participantId}
          onClick={() => onSelect(conv)}
          className={cn(
            "w-full p-4 text-left transition-colors hover:bg-muted/50",
            selectedId === conv.participantId && "bg-purple/10"
          )}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              conv.participantType === 'vendor' 
                ? "bg-gradient-to-br from-coral to-coral-dark" 
                : "bg-gradient-to-br from-teal to-teal-dark"
            )}>
              {conv.participantType === 'vendor' 
                ? <Store className="w-5 h-5 text-white" />
                : <User className="w-5 h-5 text-white" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">
                  {conv.participantName}
                </h4>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground truncate">
                  {conv.lastMessage.content}
                </p>
                {conv.unreadCount > 0 && (
                  <Badge className="bg-coral text-white shrink-0">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

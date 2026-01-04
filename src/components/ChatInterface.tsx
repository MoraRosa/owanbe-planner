import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/planner';
import { Conversation, createMessage, getConversation, markConversationAsRead } from '@/lib/indexedDb';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Send, Store, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  conversation: Conversation;
  onBack?: () => void;
  onMessageSent?: () => void;
}

export default function ChatInterface({ 
  conversation, 
  onBack,
  onMessageSent 
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;
      const msgs = await getConversation(user.id, conversation.participantId);
      setMessages(msgs);
      // Mark as read
      await markConversationAsRead(user.id, conversation.participantId);
    };
    loadMessages();
  }, [user, conversation.participantId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const msg = await createMessage({
        senderId: user.id,
        receiverId: conversation.participantId,
        content: newMessage.trim(),
        read: false,
      });
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          conversation.participantType === 'vendor' 
            ? "bg-gradient-to-br from-coral to-coral-dark" 
            : "bg-gradient-to-br from-teal to-teal-dark"
        )}>
          {conversation.participantType === 'vendor' 
            ? <Store className="w-5 h-5 text-white" />
            : <User className="w-5 h-5 text-white" />
          }
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{conversation.participantName}</h3>
          <p className="text-xs text-muted-foreground capitalize">{conversation.participantType}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground/70">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    isMe 
                      ? "bg-gradient-to-r from-purple to-purple-dark text-white rounded-br-sm" 
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    isMe ? "text-white/70" : "text-muted-foreground"
                  )}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border-purple/20 focus:border-purple"
            disabled={sending}
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-purple to-purple-dark hover:opacity-90 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

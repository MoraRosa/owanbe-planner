import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Conversation, getUserConversations } from '@/lib/indexedDb';
import ConversationList from '@/components/ConversationList';
import ChatInterface from '@/components/ChatInterface';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const convs = await getUserConversations(user.id);
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleMessageSent = () => {
    loadConversations(); // Refresh to update last message
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="h-[600px] flex">
            <div className="w-80 border-r border-border p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          <span className="text-gradient-celebration">Messages</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Communicate with vendors and manage your conversations
        </p>
      </div>

      {/* Messages Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-[600px] flex">
          {/* Conversation List - Hidden on mobile when chat is open */}
          <div className={cn(
            "w-full lg:w-80 border-r border-border flex flex-col",
            selectedConversation && "hidden lg:flex"
          )}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.participantId || null}
                onSelect={handleSelectConversation}
              />
            </div>
          </div>

          {/* Chat Interface */}
          <div className={cn(
            "flex-1 flex flex-col",
            !selectedConversation && "hidden lg:flex"
          )}>
            {selectedConversation ? (
              <ChatInterface
                conversation={selectedConversation}
                onBack={handleBack}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-purple/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-purple" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Choose a conversation from the list or contact a vendor to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

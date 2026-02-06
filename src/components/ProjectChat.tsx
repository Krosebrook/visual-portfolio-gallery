import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  createdAt: string;
}

interface ProjectChatProps {
  projectId: string;
}

export function ProjectChat({ projectId }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const me = await blink.auth.me();
      setUser(me);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!projectId) return;

    let mounted = true;
    setLoading(true);

    const initChat = async () => {
      try {
        // Fetch existing messages
        const history = await blink.db.project_messages.list({
          where: { project_id: projectId },
          orderBy: { created_at: 'asc' }
        });

        if (mounted) {
          setMessages(history as any);
          setLoading(false);
        }

        // Realtime subscription if authenticated
        if (user) {
          const channel = blink.realtime.channel(`project-chat:${projectId}`);
          channelRef.current = channel;

          await channel.subscribe({
            userId: user.id,
            metadata: { displayName: user.displayName || 'User' }
          });

          channel.onMessage((msg: any) => {
            if (mounted && msg.type === 'chat') {
              setMessages(prev => [...prev, {
                id: msg.id,
                projectId,
                userId: msg.userId,
                content: msg.data.text,
                senderName: msg.metadata?.displayName || 'Unknown',
                senderRole: msg.data.role || 'user',
                createdAt: new Date(msg.timestamp).toISOString()
              }]);
            }
          });
        }
      } catch (error) {
        console.error('Chat error:', error);
        if (mounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      mounted = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [projectId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (!user) {
      toast.error('Please sign in to join the conversation');
      return;
    }

    setSending(true);
    const content = input.trim();
    setInput('');

    try {
      const messageId = crypto.randomUUID();
      const senderName = user.displayName || 'User';
      const senderRole = user.role === 'admin' ? 'admin' : 'user';

      // Save to DB
      await blink.db.project_messages.create({
        id: messageId,
        project_id: projectId,
        user_id: user.id,
        content: content,
        sender_name: senderName,
        sender_role: senderRole
      });

      // Publish to realtime
      if (channelRef.current) {
        await channelRef.current.publish('chat', {
          text: content,
          role: senderRole
        }, {
          userId: user.id,
          metadata: { displayName: senderName }
        });
      }

      // Optimistic update if realtime is not active or for self
      if (!channelRef.current) {
        setMessages(prev => [...prev, {
          id: messageId,
          projectId,
          userId: user.id,
          content,
          senderName,
          senderRole,
          createdAt: new Date().toISOString()
        }]);
      }

    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send message');
      setInput(content); // Restore input on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Project Conversation</h3>
        </div>
        {!user && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-widest border border-amber-100">
            <Info className="h-3 w-3" /> Read Only Mode
          </div>
        )}
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30 custom-scrollbar"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Loading Conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
            <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-500">No messages yet.</p>
            <p className="text-xs text-zinc-400">Start a conversation about this project.</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id}
              className={`flex ${m.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col ${m.userId === user?.id ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {m.senderName} {m.senderRole === 'admin' && <span className="text-primary font-black">(CREATOR)</span>}
                  </span>
                  <span className="text-[9px] text-zinc-300">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm border ${
                  m.userId === user?.id 
                    ? 'bg-zinc-900 text-white border-zinc-900 rounded-tr-none' 
                    : m.senderRole === 'admin'
                      ? 'bg-primary/5 text-zinc-900 border-primary/20 rounded-tl-none'
                      : 'bg-white text-zinc-800 border-zinc-100 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-zinc-100">
        <div className="flex gap-2 relative">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={user ? "Type your message..." : "Sign in to join conversation"}
            disabled={!user || sending}
            className="rounded-xl bg-zinc-100 border-none h-11 pr-12 text-sm focus-visible:ring-primary/20"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!user || sending || !input.trim()}
            className="absolute right-1 top-1 h-9 w-9 rounded-lg shadow-lg shadow-primary/20"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

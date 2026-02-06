import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { blink } from '@/lib/blink';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function HireMeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI assistant. I know everything about this portfolio and the creator's work. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const response = await blink.ai.generateText({
        prompt: `You are a professional AI assistant for a creative portfolio named "LIBRARY01". 
        Your goal is to answer questions about the portfolio projects, the creator's skills, and availability.
        
        CONTEXT:
        - Portfolio Name: LIBRARY01
        - Style: High-end, minimalist, architectural, clean.
        - Services: Brand design, UI/UX, Web Development, 3D Visualization.
        - Tone: Sophisticated, helpful, concise, professional.
        
        If you don't know specific details, suggest the user to use the contact form below or email library@visual.com.
        
        Chat History:
        ${chatHistory}
        
        New User Message: ${input}
        
        Assistant Response:`
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again or use the contact form." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-zinc-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-none mb-1">Archive Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Always Online</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                    m.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                      : 'bg-white text-zinc-800 border rounded-tl-none shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about my work..."
                className="flex-1 bg-zinc-100 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full h-10 w-10 shrink-0 shadow-lg shadow-primary/20">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            
            <div className="px-4 py-2 bg-zinc-50 border-t flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Powered by Blink AI</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-zinc-950 scale-90' : 'bg-primary hover:scale-105'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </Button>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Clock, Trash2, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { ProjectChat } from '../ProjectChat';

interface ChatSummary {
  projectId: string;
  projectTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

export function ProjectChatManager({ projects }: { projects: any[] }) {
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSummaries();
  }, [projects]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      // Get all messages
      const messages = await blink.db.project_messages.list({
        orderBy: { created_at: 'desc' }
      });

      // Group by project
      const grouped = messages.reduce((acc: any, msg: any) => {
        if (!acc[msg.projectId]) {
          const project = projects.find(p => p.id === msg.projectId);
          acc[msg.projectId] = {
            projectId: msg.projectId,
            projectTitle: project?.title || 'Unknown Project',
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            messageCount: 0
          };
        }
        acc[msg.projectId].messageCount++;
        return acc;
      }, {});

      setSummaries(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Failed to load chat summaries');
    } finally {
      setLoading(false);
    }
  };

  const filteredSummaries = summaries.filter(s => 
    s.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedProjectId) {
    const project = projects.find(p => p.id === selectedProjectId);
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedProjectId(null)} className="rounded-full">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div>
              <h3 className="font-bold text-zinc-900">{project?.title}</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Conversation Management</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full gap-2 text-rose-600 border-rose-100 hover:bg-rose-50" onClick={async () => {
            if (confirm('Clear all messages for this project?')) {
              try {
                await blink.db.project_messages.deleteMany({ where: { project_id: selectedProjectId } });
                toast.success('Conversation cleared');
                setSelectedProjectId(null);
                fetchSummaries();
              } catch (e) { toast.error('Failed to clear'); }
            }
          }}>
            <Trash2 className="h-3.5 w-3.5" /> Clear History
          </Button>
        </div>
        <div className="flex-1 overflow-hidden p-8 max-w-4xl mx-auto w-full">
          <ProjectChat projectId={selectedProjectId} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900">Project Conversations</h2>
          <p className="text-sm text-zinc-500">Engage with users about specific project artifacts.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search conversations..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-zinc-100 border-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading conversations...</div>
      ) : filteredSummaries.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <MessageSquare className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-500">No active conversations found.</p>
          <p className="text-xs text-zinc-400 mt-1">Users will see a Chat tab on each project detail view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSummaries.map((s) => (
            <button
              key={s.projectId}
              onClick={() => setSelectedProjectId(s.projectId)}
              className="w-full text-left bg-white p-6 rounded-2xl border border-zinc-200 hover:border-primary/30 transition-all group flex justify-between items-center"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{s.projectTitle}</h4>
                  <p className="text-sm text-zinc-500 line-clamp-1 max-w-md">{s.lastMessage}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(s.lastMessageAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                      {s.messageCount} Messages
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  milestoneOrder: number;
}

interface MilestoneManagerProps {
  projectId: string;
}

export function MilestoneManager({ projectId }: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '' });

  const fetchMilestones = async () => {
    try {
      const data = await blink.db.project_milestones.list({
        where: { project_id: projectId },
        orderBy: { milestone_order: 'asc' }
      });
      setMilestones(data as any);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  useEffect(() => {
    if (projectId) fetchMilestones();
  }, [projectId]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `milestones/${projectId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      );
      setForm(prev => ({ ...prev, imageUrl: publicUrl }));
      toast.success('Milestone image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) return;

      await blink.db.project_milestones.create({
        ...form,
        projectId,
        userId: user.id,
        milestoneOrder: milestones.length + 1
      });
      toast.success('Milestone added');
      setForm({ title: '', description: '', imageUrl: '' });
      fetchMilestones();
    } catch (error) {
      toast.error('Failed to add milestone');
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      await blink.db.project_milestones.delete(id);
      toast.success('Milestone removed');
      fetchMilestones();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
      <form onSubmit={addMilestone} className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-200 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">New Milestone</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Input 
              placeholder="Milestone Title (e.g. Wireframing)" 
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
              className="bg-white"
            />
            <Textarea 
              placeholder="Brief description of this phase..." 
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              required
              className="bg-white min-h-[80px]"
            />
          </div>
          <div className="space-y-4">
            <div className="aspect-video bg-white rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden relative group">
              {form.imageUrl ? (
                <>
                  <img src={form.imageUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}>Remove</Button>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-zinc-300 mb-2" />
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Optional Image</p>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="milestone-img"
                    onChange={e => handleImageUpload(e.target.files?.[0]!)}
                  />
                  <Button variant="ghost" size="sm" className="mt-2" asChild>
                    <label htmlFor="milestone-img" className="cursor-pointer">Upload</label>
                  </Button>
                </>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full h-10 rounded-lg font-bold gap-2">
              <Plus className="h-4 w-4" /> Add to Timeline
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Current Evolution ({milestones.length})</h4>
        {milestones.map((m, idx) => (
          <div key={m.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-zinc-100 group">
            <div className="w-8 h-8 rounded-full bg-zinc-50 border flex items-center justify-center text-[10px] font-bold text-zinc-400">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-zinc-900 truncate">{m.title}</h5>
              <p className="text-xs text-zinc-500 truncate">{m.description}</p>
            </div>
            {m.imageUrl && (
              <img src={m.imageUrl} className="h-10 w-16 object-cover rounded-md border" alt="" />
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => deleteMilestone(m.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {milestones.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-zinc-50/30">
            <p className="text-xs text-zinc-400 font-medium">No milestones recorded for this archive yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

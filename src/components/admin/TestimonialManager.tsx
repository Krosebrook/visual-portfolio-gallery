import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  content: string;
  clientImage?: string;
}

interface TestimonialManagerProps {
  testimonials: Testimonial[];
  onRefresh: () => void;
}

export function TestimonialManager({ testimonials, onRefresh }: TestimonialManagerProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ clientName: '', clientRole: '', content: '', clientImage: '' });

  const createTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) return blink.auth.login();

      await blink.db.testimonials.create({ ...form, userId: user.id });
      toast.success('Testimonial added');
      setForm({ clientName: '', clientRole: '', content: '', clientImage: '' });
      onRefresh();
    } catch (error) {
      toast.error('Failed to add testimonial');
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await blink.db.testimonials.delete(id);
      toast.success('Deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <form onSubmit={createTestimonial} className="bg-zinc-50 p-8 rounded-2xl border space-y-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client Name</label>
            <Input 
              placeholder="e.g. Sarah Johnson" 
              value={form.clientName} 
              onChange={e => setForm(prev => ({ ...prev, clientName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Role / Company</label>
            <Input 
              placeholder="e.g. CTO @ TechFlow" 
              value={form.clientRole} 
              onChange={e => setForm(prev => ({ ...prev, clientRole: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Testimonial Content</label>
          <Textarea 
            placeholder="What was the experience like?" 
            value={form.content} 
            onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
            className="min-h-[100px]"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold">Add Testimonial</Button>
      </form>

      <div className="rounded-2xl border overflow-hidden max-w-4xl mx-auto">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="font-bold text-zinc-900">{t.clientName}</div>
                  <div className="text-xs text-zinc-500">{t.clientRole}</div>
                </TableCell>
                <TableCell className="italic text-zinc-600 text-sm line-clamp-2 max-w-md">{t.content}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(t.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

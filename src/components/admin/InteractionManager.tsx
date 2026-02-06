import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Lightbulb, ShieldCheck, Check, X, Trash2, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function InteractionManager({ projects }: { projects: any[] }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Audit form state
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [auditForm, setAuditForm] = useState({
    projectId: '',
    auditType: 'Security',
    score: 100,
    findings: '',
    recommendations: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [r, s, a] = await Promise.all([
        blink.db.project_reviews.list(),
        blink.db.project_suggestions.list(),
        blink.db.project_audits.list()
      ]);
      setReviews(r);
      setSuggestions(s);
      setAudits(a);
    } catch (error) {
      toast.error('Failed to load interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await blink.db.project_reviews.update(id, { status });
      toast.success(`Review ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleSuggestionStatus = async (id: string, status: string) => {
    try {
      await blink.db.project_suggestions.update(id, { status });
      toast.success(`Suggestion set to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update suggestion');
    }
  };

  const createAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.projectId || !auditForm.findings) return;
    try {
      const user = await blink.auth.me();
      if (!user) return;
      await blink.db.project_audits.create({
        id: crypto.randomUUID(),
        project_id: auditForm.projectId,
        audit_type: auditForm.auditType,
        score: auditForm.score,
        findings: auditForm.findings,
        recommendations: auditForm.recommendations,
        user_id: user.id,
        status: 'active'
      });
      toast.success('Audit report created');
      setShowAuditForm(false);
      setAuditForm({ projectId: '', auditType: 'Security', score: 100, findings: '', recommendations: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create audit');
    }
  };

  const deleteItem = async (table: string, id: string) => {
    if (!confirm('Permanently delete this item?')) return;
    try {
      await (blink.db as any)[table].delete(id);
      toast.success('Deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading interactions...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900">Project Interactions</h2>
          <p className="text-sm text-zinc-500">Manage reviews, community suggestions, and quality audits.</p>
        </div>
        <Button onClick={() => setShowAuditForm(!showAuditForm)} className="rounded-full gap-2 font-bold">
          {showAuditForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAuditForm ? 'Cancel Audit' : 'New Audit Report'}
        </Button>
      </div>

      {showAuditForm && (
        <form onSubmit={createAudit} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 px-1">Select Project</label>
              <Select value={auditForm.projectId} onValueChange={(val) => setAuditForm(prev => ({ ...prev, projectId: val }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Project Artifact" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 px-1">Audit Type</label>
              <Select value={auditForm.auditType} onValueChange={(val) => setAuditForm(prev => ({ ...prev, auditType: val }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Accessibility">Accessibility</SelectItem>
                  <SelectItem value="SEO">SEO</SelectItem>
                  <SelectItem value="Design">Design Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 px-1">Score (0-100)</label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={auditForm.score} 
                onChange={e => setAuditForm(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 px-1">Findings</label>
            <Textarea 
              placeholder="Technical findings..." 
              value={auditForm.findings}
              onChange={e => setAuditForm(prev => ({ ...prev, findings: e.target.value }))}
              className="rounded-xl min-h-[80px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 px-1">Recommendations</label>
            <Textarea 
              placeholder="Archive improvement steps..." 
              value={auditForm.recommendations}
              onChange={e => setAuditForm(prev => ({ ...prev, recommendations: e.target.value }))}
              className="rounded-xl min-h-[80px]"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl font-bold bg-primary text-white">Create Report</Button>
        </form>
      )}

      <Tabs defaultValue="reviews">
        <TabsList className="bg-zinc-100 p-1 rounded-full border mb-8">
          <TabsTrigger value="reviews" className="rounded-full gap-2">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="suggestions" className="rounded-full gap-2">Suggestions ({suggestions.length})</TabsTrigger>
          <TabsTrigger value="audits" className="rounded-full gap-2">Audits ({audits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-zinc-200 flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900">{r.userName}</span>
                    <Badge variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'} className="rounded-full text-[10px] font-bold uppercase">
                      {r.status}
                    </Badge>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-zinc-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-600 max-w-2xl">{r.content}</p>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Project: {projects.find(p => p.id === r.projectId)?.title || 'Unknown'}</div>
                </div>
                <div className="flex gap-2">
                  {r.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-8" onClick={() => handleReviewAction(r.id, 'approved')}>
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 h-8" onClick={() => handleReviewAction(r.id, 'rejected')}>
                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  <Button size="icon" variant="ghost" className="rounded-full text-zinc-400 hover:text-rose-600 h-8 w-8" onClick={() => deleteItem('project_reviews', r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-2xl border border-zinc-200 flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900">{s.userName}</span>
                    <Badge className="rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-600 border-zinc-200">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600 max-w-2xl">{s.content}</p>
                  <div className="flex gap-4">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase">Email: {s.userEmail || 'N/A'}</div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase">Project: {projects.find(p => p.id === s.projectId)?.title || 'Unknown'}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Select value={s.status} onValueChange={(val) => handleSuggestionStatus(s.id, val)}>
                    <SelectTrigger className="rounded-full h-8 text-[10px] font-bold uppercase w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="considered">Considered</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="rounded-full text-zinc-400 hover:text-rose-600 h-8" onClick={() => deleteItem('project_suggestions', s.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audits.map((a) => (
              <div key={a.id} className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{a.auditType} Audit</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Project: {projects.find(p => p.id === a.projectId)?.title || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-xl font-serif font-bold text-primary">{a.score}%</div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-zinc-600"><span className="font-bold text-zinc-900 uppercase text-[9px]">Findings:</span> {a.findings}</p>
                  {a.recommendations && (
                    <p className="text-xs text-zinc-500 italic"><span className="font-bold text-zinc-900 uppercase text-[9px] not-italic">Recs:</span> {a.recommendations}</p>
                  )}
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <Button size="sm" variant="ghost" className="rounded-full text-zinc-400 hover:text-rose-600 h-8" onClick={() => deleteItem('project_audits', a.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

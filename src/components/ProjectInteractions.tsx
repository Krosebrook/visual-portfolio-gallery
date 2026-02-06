import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Lightbulb, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectInteractionsProps {
  projectId: string;
}

export function ProjectInteractions({ projectId }: ProjectInteractionsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [reviewForm, setReviewForm] = useState({ name: '', content: '', rating: 5 });
  const [suggestionForm, setSuggestionForm] = useState({ name: '', email: '', content: '' });

  useEffect(() => {
    fetchInteractions();
  }, [projectId]);

  const fetchInteractions = async () => {
    try {
      const [r, a] = await Promise.all([
        blink.db.project_reviews.list({ where: { project_id: projectId, status: 'approved' } }),
        blink.db.project_audits.list({ where: { project_id: projectId, status: 'active' } })
      ]);
      setReviews(r);
      setAudits(a);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.content) return;
    setSubmitting(true);
    try {
      const user = await blink.auth.me();
      await blink.db.project_reviews.create({
        id: crypto.randomUUID(),
        project_id: projectId,
        user_name: reviewForm.name,
        content: reviewForm.content,
        rating: reviewForm.rating,
        user_id: user?.id || 'public_visitor',
        status: 'pending'
      });
      toast.success('Review submitted for approval');
      setReviewForm({ name: '', content: '', rating: 5 });
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionForm.name || !suggestionForm.content) return;
    setSubmitting(true);
    try {
      const user = await blink.auth.me();
      await blink.db.project_suggestions.create({
        id: crypto.randomUUID(),
        project_id: projectId,
        user_name: suggestionForm.name,
        user_email: suggestionForm.email,
        content: suggestionForm.content,
        user_id: user?.id || 'public_visitor',
        status: 'new'
      });
      toast.success('Suggestion sent to the developer');
      setSuggestionForm({ name: '', email: '', content: '' });
    } catch (error) {
      toast.error('Failed to send suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 space-y-8 bg-zinc-50/50 rounded-2xl p-6 border border-zinc-100">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Community Artifacts</h3>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="bg-zinc-100 p-1 rounded-full border mb-6">
          <TabsTrigger value="reviews" className="rounded-full gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Star className="h-4 w-4" /> Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="rounded-full gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lightbulb className="h-4 w-4" /> Suggestions
          </TabsTrigger>
          <TabsTrigger value="audits" className="rounded-full gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Audits ({audits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          {/* Review List */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-500 italic text-center py-4">Be the first to leave a review.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {r.userName?.[0] || '?'}
                      </div>
                      <span className="text-sm font-bold text-zinc-900">{r.userName}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-zinc-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{r.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Review Form */}
          <form onSubmit={submitReview} className="space-y-4 border-t pt-6">
            <h4 className="text-sm font-bold text-zinc-900">Add an Artifact Review</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Display Name" 
                value={reviewForm.name}
                onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl"
              />
              <div className="flex items-center gap-2 px-3 border rounded-xl bg-white">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`h-4 w-4 ${s <= reviewForm.rating ? 'text-amber-400 fill-current' : 'text-zinc-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Textarea 
              placeholder="Your thoughts on this artifact..." 
              value={reviewForm.content}
              onChange={e => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
              className="rounded-xl min-h-[100px]"
            />
            <Button disabled={submitting} type="submit" className="w-full rounded-xl gap-2 font-bold">
              <Send className="h-4 w-4" /> Submit Review
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="suggestions">
          <form onSubmit={submitSuggestion} className="space-y-4">
            <div className="bg-zinc-100/50 p-4 rounded-xl border border-dashed border-zinc-200 mb-6">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Have an idea for this project? Suggest a feature or improvement. These are sent directly to the archive maintainer.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Your Name" 
                value={suggestionForm.name}
                onChange={e => setSuggestionForm(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl"
              />
              <Input 
                placeholder="Contact Email (Optional)" 
                type="email"
                value={suggestionForm.email}
                onChange={e => setSuggestionForm(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <Textarea 
              placeholder="Describe your suggestion..." 
              value={suggestionForm.content}
              onChange={e => setSuggestionForm(prev => ({ ...prev, content: e.target.value }))}
              className="rounded-xl min-h-[120px]"
            />
            <Button disabled={submitting} type="submit" className="w-full rounded-xl gap-2 font-bold bg-zinc-900 text-white hover:bg-zinc-800">
              <Lightbulb className="h-4 w-4" /> Send Suggestion
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="audits">
          <div className="space-y-4">
            {audits.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-emerald-100 mx-auto mb-4" />
                <p className="text-sm text-zinc-500 font-medium">No active audits for this artifact.</p>
                <p className="text-xs text-zinc-400 mt-1">Archive items undergo periodic quality checks.</p>
              </div>
            ) : (
              audits.map((a) => (
                <div key={a.id} className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{a.auditType} Report</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Archive Security Score</p>
                      </div>
                    </div>
                    <div className="text-2xl font-serif font-bold text-primary">{a.score}%</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Key Findings</p>
                      <p className="text-xs text-zinc-600 leading-relaxed">{a.findings}</p>
                    </div>
                    {a.recommendations && (
                      <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Recommendations</p>
                        <p className="text-xs text-zinc-600 italic leading-relaxed">{a.recommendations}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

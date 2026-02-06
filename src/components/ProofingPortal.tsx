import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MessageSquare, ArrowLeft, ShieldCheck, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { ProjectDetail } from './ProjectDetail';
import { TheDot } from './ui/TheDot';

export default function ProofingPortal() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await blink.db.projects.get(projectId!);
        if (!data) {
          toast.error('Project not found');
          navigate('/');
          return;
        }
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Access denied');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await blink.db.inquiries.create({
        name: 'Client Approval',
        email: 'client@system.auto',
        subject: `APPROVAL: ${project.title}`,
        message: `Project approved. Feedback: ${feedback || 'No additional comments.'}`,
        userId: project.userId
      });
      toast.success('Project approved! The creator has been notified.');
      setFeedback('');
    } catch (error) {
      toast.error('Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b py-6">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-xl font-serif font-bold tracking-tighter flex items-center gap-1">
              PROOFING<span className="text-primary italic">HUB</span>
              <TheDot size="sm" className="mb-1" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full border">
              Private Session
            </span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm"
          >
            <div className="aspect-video relative group cursor-pointer" onClick={() => setShowDetail(true)}>
              <img src={project.imageUrl} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full gap-2">
                  Review Details
                </Button>
              </div>
            </div>
            <div className="p-10">
              <div className="text-primary font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Approval
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tighter mb-6">{project.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">{project.description}</p>
            </div>
          </motion.div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-10">
            <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-emerald-600" /> Client Action Required
            </h3>
            <p className="text-emerald-700 mb-8">
              Please review the project artifacts above. If you are satisfied with the current progress, click 'Approve Project'. You can also provide feedback in the panel to the right.
            </p>
            <Button 
              onClick={handleApprove} 
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 px-10 font-bold gap-2 shadow-xl shadow-emerald-200"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              Approve Project
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-zinc-200 p-10 shadow-sm sticky top-32">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" /> Feedback Panel
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Comments / Revisions</label>
                <Textarea 
                  placeholder="Tell the creator what you think..." 
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="min-h-[200px] bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                />
              </div>
              <Button 
                onClick={handleApprove}
                variant="outline"
                className="w-full h-14 rounded-xl font-bold gap-2 border-zinc-200"
                disabled={!feedback || submitting}
              >
                <Send className="h-4 w-4" /> Send Feedback Only
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-100 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Encrypted Archive</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">This session is protected by our visual library archive protocol.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProjectDetail 
        project={showDetail ? project : null} 
        onClose={() => setShowDetail(false)} 
      />
    </div>
  );
}

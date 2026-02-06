import React, { useState } from 'react';
import { Trash2, Eye, EyeOff, Link as LinkIcon, CheckCircle2, ChevronDown, ChevronUp, Clock, Wand2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { blink } from '@/lib/blink';
import { MilestoneManager } from './MilestoneManager';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  visibility: 'public' | 'private';
  tags?: string;
  zip_url?: string;
}

interface ProjectManagerProps {
  projects: Project[];
  onRefresh: () => void;
}

export function ProjectManager({ projects, onRefresh }: ProjectManagerProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [isMagicWriting, setIsMagicWriting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [magicWriteDialog, setMagicWriteDialog] = useState<{ open: boolean; project: Project | null; content: string }>({
    open: false,
    project: null,
    content: ''
  });
  const [auditDialog, setAuditDialog] = useState<{ open: boolean; project: Project | null; audit: any }>({
    open: false,
    project: null,
    audit: null
  });

  const handleManualAudit = async (project: Project) => {
    setIsAuditing(true);
    try {
      const auditResult = await blink.ai.generateObject({
        schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            findings: { type: 'string' },
            recommendations: { type: 'string' },
            auditType: { type: 'string' }
          },
          required: ['score', 'findings', 'recommendations', 'auditType']
        },
        prompt: `Perform a comprehensive, professional-grade audit for this portfolio project.
        Title: ${project.title}
        Description: ${project.description}
        Category: ${project.category}
        Tags: ${project.tags}
        
        Audit based on modern design standards, storytelling effectiveness, and professional impact. 
        Provide a score (0-100), key findings, and specific actionable recommendations.`
      });

      const audit = auditResult.object as any;
      
      const user = await blink.auth.me();
      if (user) {
        await blink.db.project_audits.create({
          project_id: project.id,
          audit_type: audit.auditType || 'Professional Grade Audit',
          score: audit.score,
          findings: audit.findings,
          recommendations: audit.recommendations,
          user_id: user.id
        });
      }

      setAuditDialog({ open: true, project, audit });
      toast.success('Professional audit completed!');
    } catch (error) {
      toast.error('Audit failed');
    } finally {
      setIsAuditing(false);
    }
  };

  const toggleVisibility = async (project: Project) => {
    try {
      const newVisibility = project.visibility === 'public' ? 'private' : 'public';
      await blink.db.projects.update(project.id, { visibility: newVisibility });
      toast.success(`Project is now ${newVisibility}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const copyProofingLink = (projectId: string) => {
    const url = `${window.location.origin}/proofing/${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success('Proofing link copied to clipboard');
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this project from the library?')) return;
    try {
      await blink.db.projects.delete(id);
      toast.success('Project deleted');
      onRefresh();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleMagicWrite = async (project: Project) => {
    setIsMagicWriting(true);
    try {
      const result = await blink.ai.generateText({
        prompt: `Write a professional and compelling case study description for a design portfolio. 
        Project Title: ${project.title}
        Current Brief: ${project.description}
        Category: ${project.category}
        
        The description should be structured with 2-3 short paragraphs covering the Challenge, Solution, and Impact. 
        Keep the tone elevated, minimal, and professional.`
      });
      setMagicWriteDialog({ open: true, project, content: result });
    } catch (error) {
      toast.error('AI Generation failed');
    } finally {
      setIsMagicWriting(false);
    }
  };

  const saveMagicWrite = async () => {
    if (!magicWriteDialog.project) return;
    try {
      await blink.db.projects.update(magicWriteDialog.project.id, { 
        description: magicWriteDialog.content 
      });
      toast.success('Case study updated!');
      setMagicWriteDialog({ open: false, project: null, content: '' });
      onRefresh();
    } catch (error) {
      toast.error('Failed to save update');
    }
  };

  return (
    <div className="p-8">
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Archive Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <React.Fragment key={project.id}>
                <TableRow className={expandedProjectId === project.id ? 'bg-zinc-50/50' : ''}>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                      className="h-8 w-8 rounded-full"
                    >
                      {expandedProjectId === project.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <img 
                      src={project.imageUrl} 
                      alt="" 
                      className="h-12 w-20 object-cover rounded-lg border shadow-sm" 
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-zinc-900">{project.title}</div>
                    <div className="text-xs text-zinc-400 truncate max-w-[200px]">{project.description}</div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-zinc-100 text-[10px] font-bold uppercase tracking-widest">
                      {project.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleVisibility(project)}
                      className={`gap-2 rounded-full font-bold uppercase text-[10px] tracking-widest ${
                        project.visibility === 'public' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      {project.visibility === 'public' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {project.visibility}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleManualAudit(project)}
                        disabled={isAuditing}
                        className="hover:bg-primary/5 hover:text-primary rounded-full"
                        title="Professional Audit"
                      >
                        {isAuditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMagicWrite(project)}
                        disabled={isMagicWriting}
                        className="hover:bg-primary/5 hover:text-primary rounded-full"
                        title="AI Magic Write"
                      >
                        {isMagicWriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                        className={`hover:bg-primary/5 hover:text-primary rounded-full ${expandedProjectId === project.id ? 'text-primary bg-primary/5' : ''}`}
                        title="Manage Milestones"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyProofingLink(project.id)}
                        className="hover:bg-primary/5 hover:text-primary rounded-full"
                        title="Copy Proofing Link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteProject(project.id)} 
                        className="hover:bg-destructive/5 hover:text-destructive rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedProjectId === project.id && (
                  <TableRow className="bg-zinc-50/30">
                    <TableCell colSpan={6} className="p-0">
                      <div className="px-12 py-8 border-t border-zinc-100">
                        <div className="max-w-4xl">
                          <MilestoneManager projectId={project.id} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={magicWriteDialog.open} onOpenChange={(open) => setMagicWriteDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Case Study Generator
            </DialogTitle>
            <DialogDescription>
              Review and refine the AI-generated case study for <strong>{magicWriteDialog.project?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              value={magicWriteDialog.content}
              onChange={(e) => setMagicWriteDialog(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[300px] bg-zinc-50 border-zinc-200 focus:ring-primary/20"
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setMagicWriteDialog({ open: false, project: null, content: '' })}>
              Cancel
            </Button>
            <Button onClick={saveMagicWrite} className="bg-zinc-900 text-white hover:bg-zinc-800">
              Apply to Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={auditDialog.open} onOpenChange={(open) => setAuditDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Professional Portfolio Audit
            </DialogTitle>
            <DialogDescription>
              Performance and quality analysis for <strong>{auditDialog.project?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="text-center">
                <div className="text-5xl font-serif font-bold text-zinc-900 mb-2">{auditDialog.audit?.score}%</div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Quality Score</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Key Findings</h4>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm leading-relaxed text-zinc-600">
                  {auditDialog.audit?.findings}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Recommendations</h4>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-sm leading-relaxed text-emerald-900">
                  {auditDialog.audit?.recommendations}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditDialog({ open: false, project: null, audit: null })}>
              Close Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

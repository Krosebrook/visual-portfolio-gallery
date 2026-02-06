import React, { useState } from 'react';
import { Trash2, Eye, EyeOff, Link as LinkIcon, ChevronDown, ChevronUp, Clock, Wand2, Loader2, Sparkles, ShieldCheck, Pencil, Save, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  zipUrl?: string;
  mediaType?: string;
  videoUrl?: string;
  modelUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
}

interface ProjectManagerProps {
  projects: Project[];
  onRefresh: () => void;
}

export function ProjectManager({ projects, onRefresh }: ProjectManagerProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [isMagicWriting, setIsMagicWriting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const startEditing = (project: Project) => {
    setEditingProjectId(project.id);
    setEditForm({
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags || '',
      imageUrl: project.imageUrl,
      mediaType: project.mediaType || 'image',
      videoUrl: project.videoUrl || '',
      modelUrl: project.modelUrl || '',
      demoUrl: project.demoUrl || '',
      githubUrl: project.githubUrl || '',
    });
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditForm({});
  };

  const saveEdits = async () => {
    if (!editingProjectId) return;
    setIsSaving(true);
    try {
      await blink.db.projects.update(editingProjectId, editForm);
      toast.success('Project updated successfully!');
      setEditingProjectId(null);
      setEditForm({});
      onRefresh();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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
        await blink.db.projectAudits.create({
          projectId: project.id,
          auditType: audit.auditType || 'Professional Grade Audit',
          score: audit.score,
          findings: audit.findings,
          recommendations: audit.recommendations,
          userId: user.id,
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

  const handleEditImageUpload = async (file: File) => {
    if (!file) return;
    try {
      toast.info('Uploading new image...');
      const { publicUrl } = await blink.storage.upload(
        file,
        `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      );
      setEditForm(prev => ({ ...prev, imageUrl: publicUrl }));
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Image upload failed');
    }
  };

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          <Sparkles className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-600 mb-2">No projects yet</h3>
          <p className="text-sm text-zinc-400">Upload files or import from connectors in the Project Intake tab to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-zinc-900">{projects.length} Project{projects.length !== 1 ? 's' : ''} in Library</h3>
        <p className="text-sm text-zinc-500">Click the edit icon to modify any project. Changes are saved instantly.</p>
      </div>

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
                <TableRow className={expandedProjectId === project.id || editingProjectId === project.id ? 'bg-zinc-50/50' : ''}>
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
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => editingProjectId === project.id ? cancelEditing() : startEditing(project)}
                        className={`rounded-full ${editingProjectId === project.id ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 hover:text-primary'}`}
                        title="Edit Project"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Inline Edit Row */}
                {editingProjectId === project.id && (
                  <TableRow className="bg-blue-50/30">
                    <TableCell colSpan={6} className="p-0">
                      <div className="px-8 py-6 border-t border-blue-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                            <Pencil className="h-3.5 w-3.5" /> Editing Project
                          </h4>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={cancelEditing} className="text-zinc-500">
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" onClick={saveEdits} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                              {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                              Save Changes
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Title</label>
                              <Input 
                                value={editForm.title || ''} 
                                onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                              <Textarea 
                                value={editForm.description || ''} 
                                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-white min-h-[100px]"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
                                <Input 
                                  value={editForm.category || ''} 
                                  onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Media Type</label>
                                <select 
                                  value={editForm.mediaType || 'image'}
                                  onChange={e => setEditForm(prev => ({ ...prev, mediaType: e.target.value }))}
                                  className="w-full h-10 px-3 rounded-md bg-white border border-zinc-200 text-sm"
                                >
                                  <option value="image">Image</option>
                                  <option value="video">Video</option>
                                  <option value="3d">3D Model</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tags</label>
                              <Input 
                                value={editForm.tags || ''} 
                                onChange={e => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                placeholder="Comma-separated tags"
                                className="bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cover Image</label>
                              <div className="aspect-video bg-zinc-100 rounded-xl overflow-hidden relative group border">
                                {editForm.imageUrl ? (
                                  <>
                                    <img src={editForm.imageUrl} className="w-full h-full object-cover" alt="Cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        id={`edit-image-${project.id}`}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleEditImageUpload(file);
                                        }}
                                      />
                                      <Button variant="secondary" size="sm" asChild>
                                        <label htmlFor={`edit-image-${project.id}`} className="cursor-pointer">
                                          <ImageIcon className="h-4 w-4 mr-1" /> Replace Image
                                        </label>
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-zinc-400">
                                    <ImageIcon className="h-8 w-8" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Image URL</label>
                              <Input 
                                value={editForm.imageUrl || ''} 
                                onChange={e => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                className="bg-white text-xs"
                              />
                            </div>
                            {(editForm.mediaType === 'video') && (
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Video URL</label>
                                <Input 
                                  value={editForm.videoUrl || ''} 
                                  onChange={e => setEditForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                                  className="bg-white"
                                />
                              </div>
                            )}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Demo URL</label>
                              <Input 
                                value={editForm.demoUrl || ''} 
                                onChange={e => setEditForm(prev => ({ ...prev, demoUrl: e.target.value }))}
                                className="bg-white"
                                placeholder="https://your-project.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Milestones Row */}
                {expandedProjectId === project.id && editingProjectId !== project.id && (
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

      {/* Magic Write Dialog */}
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

      {/* Audit Dialog */}
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

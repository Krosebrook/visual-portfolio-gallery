import React, { useState } from 'react';
import { Trash2, Eye, EyeOff, Link as LinkIcon, CheckCircle2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
}

interface ProjectManagerProps {
  projects: Project[];
  onRefresh: () => void;
}

export function ProjectManager({ projects, onRefresh }: ProjectManagerProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

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
    </div>
  );
}

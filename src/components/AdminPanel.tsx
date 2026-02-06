import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, Loader2, MessageSquare, Briefcase, Star, Globe, Github, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { blink } from '@/lib/blink';
import { format } from 'date-fns';
import { TheDot } from './ui/TheDot';

export function AdminPanel({ isOpen, onClose, onProjectAdded }: { isOpen: boolean, onClose: () => void, onProjectAdded: () => void }) {
  const [activeTab, setActiveTab] = useState('intake');
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Form States
  const [projectForm, setProjectForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    imageUrl: '',
    githubUrl: '',
    demoUrl: ''
  });
  const [testimonialForm, setTestimonialForm] = useState({ clientName: '', clientRole: '', content: '', clientImage: '' });

  // Fetch Data
  const fetchData = async () => {
    try {
      const [p, t, i] = await Promise.all([
        blink.db.projects.list(),
        blink.db.testimonials.list(),
        blink.db.inquiries.list()
      ]);
      setProjects(p);
      setTestimonials(t);
      setInquiries(i);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  // --- Handlers ---

  const handleImageUpload = async (file: File, type: 'project' | 'client') => {
    if (!file) return;
    setLoading(true);
    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      );
      if (type === 'project') setProjectForm(prev => ({ ...prev, imageUrl: publicUrl }));
      else setTestimonialForm(prev => ({ ...prev, clientImage: publicUrl }));
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIntakeGeneration = async () => {
    if (!projectForm.githubUrl && !projectForm.demoUrl) {
      return toast.error('Please provide a URL to analyze');
    }

    setIsGenerating(true);
    try {
      // Simulate AI Analysis of the project
      const result = await blink.ai.generateObject({
        schema: {
          title: 'string',
          description: 'string',
          category: 'string',
          suggestedImagePrompt: 'string'
        },
        prompt: `Analyze this project URL: ${projectForm.githubUrl || projectForm.demoUrl}. 
        Provide a professional title, a compelling 3-sentence description for a visual library, 
        and a broad category (e.g., Technology, Design, Fintech, Social). 
        Also suggest a DALL-E style prompt for a high-quality abstract background image representing this project.`
      });

      const { title, description, category, suggestedImagePrompt } = result as any;

      // Generate a placeholder image based on the prompt if no image is provided
      const images = await blink.ai.generateImage({
        prompt: suggestedImagePrompt + " -- High quality, architectural, clean, professional aesthetic.",
        n: 1
      });

      setProjectForm(prev => ({
        ...prev,
        title,
        description,
        category,
        imageUrl: images[0]
      }));

      toast.success('Project assets generated successfully!');
    } catch (error) {
      toast.error('Failed to generate assets');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) return blink.auth.login();

      await blink.db.projects.create({ ...projectForm, userId: user.id });
      toast.success('Project added to library');
      setProjectForm({ title: '', description: '', category: '', imageUrl: '', githubUrl: '', demoUrl: '' });
      fetchData();
      onProjectAdded();
    } catch (error) {
      toast.error('Failed to archive project');
    } finally {
      setLoading(false);
    }
  };

  const createTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) return blink.auth.login();

      await blink.db.testimonials.create({ ...testimonialForm, userId: user.id });
      toast.success('Testimonial added');
      setTestimonialForm({ clientName: '', clientRole: '', content: '', clientImage: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add testimonial');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (type: 'projects' | 'testimonials' | 'inquiries', id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await blink.db[type].delete(id);
      toast.success('Deleted successfully');
      fetchData();
      if (type === 'projects') onProjectAdded();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-6xl h-[90vh] bg-background rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <TheDot size="sm" />
                <h2 className="text-2xl font-serif font-bold tracking-tight">Library Management</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-8 py-4 border-b">
                  <TabsList className="bg-zinc-100 p-1 rounded-full border">
                    <TabsTrigger value="intake" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><Plus className="h-4 w-4" /> Project Intake</TabsTrigger>
                    <TabsTrigger value="projects" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><Briefcase className="h-4 w-4" /> Library</TabsTrigger>
                    <TabsTrigger value="testimonials" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><Star className="h-4 w-4" /> Reviews</TabsTrigger>
                    <TabsTrigger value="inquiries" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><MessageSquare className="h-4 w-4" /> Inquiries</TabsTrigger>
                  </TabsList>
                </div>

                {/* INTAKE TAB */}
                <TabsContent value="intake" className="flex-1 overflow-auto p-8 space-y-10">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                      <h3 className="text-3xl font-serif font-bold mb-4 flex items-center gap-2">
                        Archive New Work
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Provide a repository or demo link. Our system will analyze the source, generate documentation snapshots, and create visual assets for your library.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Source URLs</label>
                          <div className="space-y-3">
                            <div className="relative">
                              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <Input 
                                placeholder="GitHub Repository URL" 
                                value={projectForm.githubUrl}
                                onChange={e => setProjectForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                                className="pl-10 h-12 bg-zinc-50 border-zinc-200"
                              />
                            </div>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <Input 
                                placeholder="Demo / Live URL" 
                                value={projectForm.demoUrl}
                                onChange={e => setProjectForm(prev => ({ ...prev, demoUrl: e.target.value }))}
                                className="pl-10 h-12 bg-zinc-50 border-zinc-200"
                              />
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={handleIntakeGeneration} 
                          disabled={isGenerating || loading}
                          className="w-full h-14 rounded-xl text-lg font-bold gap-2 shadow-xl shadow-primary/10"
                        >
                          {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="h-5 w-5" />}
                          {isGenerating ? 'Analyzing Source...' : 'Generate Library Assets'}
                        </Button>

                        <div className="pt-6 border-t border-zinc-100">
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-4">Manual Override</label>
                          <div className="space-y-4">
                            <Input 
                              placeholder="Override Title" 
                              value={projectForm.title}
                              onChange={e => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                              className="bg-zinc-50 border-zinc-200"
                            />
                            <Input 
                              placeholder="Override Category" 
                              value={projectForm.category}
                              onChange={e => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                              className="bg-zinc-50 border-zinc-200"
                            />
                            <Textarea 
                              placeholder="Project Description" 
                              value={projectForm.description}
                              onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-zinc-50 border-zinc-200 min-h-[120px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="aspect-video bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden group relative">
                          {projectForm.imageUrl ? (
                            <>
                              <img src={projectForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="secondary" size="sm" onClick={() => setProjectForm(prev => ({ ...prev, imageUrl: '' }))}>Replace</Button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-8">
                              <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                              <p className="text-sm text-zinc-400 font-medium">Asset Preview Area</p>
                              <p className="text-xs text-zinc-400 mt-1">Images will appear here after analysis</p>
                              <Input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                id="manual-upload"
                                onChange={(e) => handleImageUpload(e.target.files?.[0]!, 'project')}
                              />
                              <Button variant="ghost" size="sm" className="mt-4" asChild>
                                <label htmlFor="manual-upload" className="cursor-pointer">Upload Manually</label>
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                          <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">System Insights</h4>
                          <p className="text-sm text-zinc-600 leading-relaxed italic">
                            {isGenerating 
                              ? "Our AI is currently examining the code structure and live behavior to extract key features..." 
                              : projectForm.title 
                                ? `Ready to archive "${projectForm.title}". All assets have been curated for visual consistency.`
                                : "Awaiting project input. We recommend starting with a GitHub URL for best documentation extraction."}
                          </p>
                        </div>

                        <Button 
                          onClick={createProject} 
                          disabled={loading || !projectForm.title || !projectForm.imageUrl}
                          className="w-full h-14 rounded-xl text-lg font-bold gap-2 bg-zinc-950 hover:bg-zinc-900 shadow-xl shadow-black/5"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <Briefcase className="h-5 w-5" />}
                          Archive to Library
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* PROJECTS LIST TAB */}
                <TabsContent value="projects" className="flex-1 overflow-auto p-8">
                  <div className="rounded-2xl border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-zinc-50/50">
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Archive Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Manage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell><img src={project.imageUrl} alt="" className="h-12 w-20 object-cover rounded-lg border shadow-sm" /></TableCell>
                            <TableCell>
                              <div className="font-bold text-zinc-900">{project.title}</div>
                              <div className="text-xs text-zinc-400 truncate max-w-[200px]">{project.description}</div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full bg-zinc-100 text-[10px] font-bold uppercase tracking-widest">
                                {project.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => deleteItem('projects', project.id)} className="hover:bg-destructive/5 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* TESTIMONIALS TAB */}
                <TabsContent value="testimonials" className="flex-1 overflow-auto p-8 space-y-8">
                  <form onSubmit={createTestimonial} className="bg-zinc-50 p-8 rounded-2xl border space-y-6 max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client Name</label>
                        <Input 
                          placeholder="e.g. Sarah Johnson" 
                          value={testimonialForm.clientName} 
                          onChange={e => setTestimonialForm(prev => ({ ...prev, clientName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Role / Company</label>
                        <Input 
                          placeholder="e.g. CTO @ TechFlow" 
                          value={testimonialForm.clientRole} 
                          onChange={e => setTestimonialForm(prev => ({ ...prev, clientRole: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Testimonial Content</label>
                      <Textarea 
                        placeholder="What was the experience like?" 
                        value={testimonialForm.content} 
                        onChange={e => setTestimonialForm(prev => ({ ...prev, content: e.target.value }))}
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
                              <Button variant="ghost" size="icon" onClick={() => deleteItem('testimonials', t.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* INQUIRIES TAB */}
                <TabsContent value="inquiries" className="flex-1 overflow-auto p-8">
                  <div className="rounded-2xl border overflow-hidden max-w-6xl mx-auto">
                    <Table>
                      <TableHeader className="bg-zinc-50/50">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Sender</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead className="text-right">Manage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inquiries.map((inquiry) => (
                          <TableRow key={inquiry.id}>
                            <TableCell className="whitespace-nowrap text-zinc-400 text-xs font-mono">
                              {inquiry.createdAt ? format(new Date(inquiry.createdAt), 'yyyy.MM.dd') : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="font-bold text-zinc-900">{inquiry.name}</div>
                              <div className="text-xs text-zinc-400">{inquiry.email}</div>
                            </TableCell>
                            <TableCell className="font-medium text-zinc-700">{inquiry.subject}</TableCell>
                            <TableCell className="max-w-md truncate text-zinc-500 text-sm">{inquiry.message}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => deleteItem('inquiries', inquiry.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

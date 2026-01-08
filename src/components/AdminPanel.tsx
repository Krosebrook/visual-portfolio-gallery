import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, Loader2, MessageSquare, Briefcase, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { blink } from '@/lib/blink';
import { format } from 'date-fns';

export function AdminPanel({ isOpen, onClose, onProjectAdded }: { isOpen: boolean, onClose: () => void, onProjectAdded: () => void }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Form States
  const [projectForm, setProjectForm] = useState({ title: '', description: '', category: '', imageUrl: '' });
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

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) return blink.auth.login();

      await blink.db.projects.create({ ...projectForm, userId: user.id });
      toast.success('Project created');
      setProjectForm({ title: '', description: '', category: '', imageUrl: '' });
      fetchData();
      onProjectAdded();
    } catch (error) {
      toast.error('Failed to create project');
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-[85vh] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-zinc-900/50">
              <h2 className="text-2xl font-serif text-white">Dashboard</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-6 py-4 border-b border-white/5">
                  <TabsList className="bg-white/5 border border-white/5">
                    <TabsTrigger value="projects" className="gap-2"><Briefcase className="h-4 w-4" /> Projects</TabsTrigger>
                    <TabsTrigger value="testimonials" className="gap-2"><Star className="h-4 w-4" /> Testimonials</TabsTrigger>
                    <TabsTrigger value="inquiries" className="gap-2"><MessageSquare className="h-4 w-4" /> Inquiries</TabsTrigger>
                  </TabsList>
                </div>

                {/* PROJECTS TAB */}
                <TabsContent value="projects" className="flex-1 overflow-auto p-6 space-y-8">
                  <form onSubmit={createProject} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/5">
                    <div className="space-y-4">
                      <Input 
                        placeholder="Project Title" 
                        value={projectForm.title} 
                        onChange={e => setProjectForm(prev => ({ ...prev, title: e.target.value }))} 
                        className="bg-black/40"
                        required
                      />
                      <Input 
                        placeholder="Category" 
                        value={projectForm.category} 
                        onChange={e => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                        className="bg-black/40"
                        required
                      />
                      <div className="flex items-center gap-4">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e.target.files?.[0]!, 'project')}
                          className="bg-black/40"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 flex flex-col">
                      <Textarea 
                        placeholder="Description" 
                        value={projectForm.description} 
                        onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-black/40 flex-1 min-h-[100px]"
                        required
                      />
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />} Add Project
                      </Button>
                    </div>
                  </form>

                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell><img src={project.imageUrl} alt="" className="h-10 w-16 object-cover rounded" /></TableCell>
                            <TableCell className="font-medium">{project.title}</TableCell>
                            <TableCell>{project.category}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => deleteItem('projects', project.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* TESTIMONIALS TAB */}
                <TabsContent value="testimonials" className="flex-1 overflow-auto p-6 space-y-8">
                  <form onSubmit={createTestimonial} className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Client Name" 
                        value={testimonialForm.clientName} 
                        onChange={e => setTestimonialForm(prev => ({ ...prev, clientName: e.target.value }))}
                        className="bg-black/40"
                        required
                      />
                      <Input 
                        placeholder="Role / Company" 
                        value={testimonialForm.clientRole} 
                        onChange={e => setTestimonialForm(prev => ({ ...prev, clientRole: e.target.value }))}
                        className="bg-black/40"
                        required
                      />
                    </div>
                    <Textarea 
                      placeholder="Testimonial Content" 
                      value={testimonialForm.content} 
                      onChange={e => setTestimonialForm(prev => ({ ...prev, content: e.target.value }))}
                      className="bg-black/40"
                      required
                    />
                    <Button type="submit" disabled={loading} className="w-full">Add Testimonial</Button>
                  </form>

                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testimonials.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.clientName}</TableCell>
                            <TableCell>{t.clientRole}</TableCell>
                            <TableCell className="truncate max-w-xs">{t.content}</TableCell>
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
                <TabsContent value="inquiries" className="flex-1 overflow-auto p-6">
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inquiries.map((inquiry) => (
                          <TableRow key={inquiry.id}>
                            <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                              {inquiry.createdAt ? format(new Date(inquiry.createdAt), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{inquiry.name}</div>
                              <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                            </TableCell>
                            <TableCell>{inquiry.subject}</TableCell>
                            <TableCell className="max-w-md truncate">{inquiry.message}</TableCell>
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

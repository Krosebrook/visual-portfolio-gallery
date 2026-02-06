import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Briefcase, Star, MessageSquare, Mail, Activity, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { blink } from '@/lib/blink';
import { TheDot } from './ui/TheDot';
import { IntakeFlow } from './admin/IntakeFlow';
import { ProjectManager } from './admin/ProjectManager';
import { TestimonialManager } from './admin/TestimonialManager';
import { InquiryList } from './admin/InquiryList';
import { NewsletterList } from './admin/NewsletterList';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { InteractionManager } from './admin/InteractionManager';
import { ProfileSettings } from './admin/ProfileSettings';
import { User as UserIcon } from 'lucide-react';

export function AdminPanel({ 
  isOpen, 
  onClose, 
  onProjectAdded,
  isPage = false 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onProjectAdded: () => void,
  isPage?: boolean
}) {
  const [activeTab, setActiveTab] = useState('intake');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [projectViews, setProjectViews] = useState<any[]>([]);
  const [projectClicks, setProjectClicks] = useState<any[]>([]);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [p, t, i, n, v, c] = await Promise.all([
        blink.db.projects.list(),
        blink.db.testimonials.list(),
        blink.db.inquiries.list(),
        blink.db.newsletter_subs.list(),
        blink.db.project_views.list(),
        blink.db.project_clicks.list()
      ]);
      setProjects(p);
      setTestimonials(t);
      setInquiries(i);
      setNewsletterSubs(n);
      setProjectViews(v);
      setProjectClicks(c);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const deleteItem = async (type: 'projects' | 'testimonials' | 'inquiries' | 'newsletter_subs', id: string) => {
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
        <div className={`fixed inset-0 z-[110] flex items-center justify-center ${isPage ? 'p-0' : 'p-4'}`}>
          {!isPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
            />
          )}
          <motion.div
            initial={isPage ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={isPage ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
            className={`relative w-full ${isPage ? 'max-w-none h-full rounded-none' : 'max-w-6xl h-[90vh] rounded-2xl'} bg-background border-zinc-200 shadow-2xl overflow-hidden flex flex-col ${!isPage ? 'border' : ''}`}
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
                    <TabsTrigger value="interactions" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><Repeat className="h-4 w-4" /> Interactions</TabsTrigger>
                    <TabsTrigger value="testimonials" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><Star className="h-4 w-4" /> Reviews</TabsTrigger>
                    <TabsTrigger value="inquiries" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><MessageSquare className="h-4 w-4" /> Inquiries</TabsTrigger>
                    <TabsTrigger value="newsletter" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><Mail className="h-4 w-4" /> Subscribers</TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><Activity className="h-4 w-4" /> Analytics</TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"><UserIcon className="h-4 w-4" /> Settings</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="intake" className="flex-1 overflow-auto">
                  <IntakeFlow 
                    onProjectAdded={() => {
                      fetchData();
                      onProjectAdded();
                    }}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </TabsContent>

                <TabsContent value="projects" className="flex-1 overflow-auto">
                  <ProjectManager 
                    projects={projects} 
                    onRefresh={() => {
                      fetchData();
                      onProjectAdded();
                    }} 
                  />
                </TabsContent>

                <TabsContent value="interactions" className="flex-1 overflow-auto">
                  <InteractionManager projects={projects} />
                </TabsContent>

                <TabsContent value="testimonials" className="flex-1 overflow-auto">
                  <TestimonialManager 
                    testimonials={testimonials} 
                    onRefresh={fetchData} 
                  />
                </TabsContent>

                <TabsContent value="inquiries" className="flex-1 overflow-auto">
                  <InquiryList 
                    inquiries={inquiries} 
                    onDelete={(id) => deleteItem('inquiries', id)} 
                  />
                </TabsContent>

                <TabsContent value="newsletter" className="flex-1 overflow-auto">
                  <NewsletterList 
                    subscriptions={newsletterSubs} 
                    onDelete={(id) => deleteItem('newsletter_subs', id)} 
                  />
                </TabsContent>

                <TabsContent value="analytics" className="flex-1 overflow-auto">
                  <AnalyticsDashboard 
                    projects={projects} 
                    views={projectViews} 
                    clicks={projectClicks} 
                  />
                </TabsContent>

                <TabsContent value="settings" className="flex-1 overflow-auto">
                  <ProfileSettings />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

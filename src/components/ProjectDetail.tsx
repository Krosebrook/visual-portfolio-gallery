import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, ArrowRight, Github, Globe, ExternalLink, Code, Layers, Sparkles, Box, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TheDot } from './ui/TheDot';
import { blink } from '@/lib/blink';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Environment } from '@react-three/drei';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  mediaType?: 'image' | 'video' | '3d';
  videoUrl?: string;
  modelUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  milestoneOrder: number;
}

interface ProjectDetailProps {
  project: Project | null;
  onClose: () => void;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={0.01} />;
}

function VideoPlayer({ url }: { url: string }) {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');

  if (isYoutube) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (isVimeo) {
    const videoId = url.split('/').pop();
    return (
      <iframe
        src={`https://player.vimeo.com/video/${videoId}`}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video src={url} controls className="w-full h-full object-cover" />
  );
}

export function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef<number>(0);
  const viewId = useRef<string | null>(null);

  useEffect(() => {
    if (project) {
      viewStartTime.current = Date.now();
      viewId.current = crypto.randomUUID();
      
      // Initial view log in custom table
      const logInitialView = async () => {
        try {
          const user = await blink.db.users.get((await blink.auth.me())?.id || 'public');
          await blink.db.project_views.create({
            id: viewId.current!,
            project_id: project.id,
            user_id: user?.id || 'public_visitor',
            view_duration: 0
          });
        } catch (e) { console.error(e); }
      };
      logInitialView();

      // SEO & Metadata
      const previousTitle = document.title;
      document.title = `${project.title} | Archive Visual Portfolio`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      const originalDescription = metaDescription?.getAttribute('content');
      if (metaDescription) {
        metaDescription.setAttribute('content', project.description.substring(0, 160));
      }

      // OG Tags
      const updateOgTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      updateOgTag('og:title', project.title);
      updateOgTag('og:description', project.description.substring(0, 160));
      updateOgTag('og:image', project.imageUrl);
      updateOgTag('og:url', window.location.href);

      return () => {
        // Track duration on unmount
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        if (viewId.current) {
          blink.db.project_views.update(viewId.current, { view_duration: duration })
            .catch(console.error);
        }

        document.title = previousTitle;
        if (metaDescription && originalDescription) {
          metaDescription.setAttribute('content', originalDescription);
        }
      };
    }
  }, [project]);

  useEffect(() => {
    if (project) {
      setLoadingMilestones(true);
      blink.db.project_milestones.list({
        where: { project_id: project.id },
        orderBy: { milestone_order: 'asc' }
      }).then(data => {
        setMilestones(data as any);
      }).finally(() => {
        setLoadingMilestones(false);
      });
    }
  }, [project]);

  if (!project) return null;

  const renderMedia = () => {
    if (project.mediaType === 'video' && project.videoUrl) {
      return <VideoPlayer url={project.videoUrl} />;
    }
    if (project.mediaType === '3d' && project.modelUrl) {
      return (
        <div className="w-full h-full bg-zinc-900 cursor-grab active:cursor-grabbing">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <Stage intensity={0.5} environment="city" adjustCamera intensity={1}>
                <Model url={project.modelUrl} />
              </Stage>
              <OrbitControls makeDefault />
            </Suspense>
          </Canvas>
          <div className="absolute top-4 right-16 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-widest pointer-events-none">
            3D Interaction Active
          </div>
        </div>
      );
    }
    return (
      <img 
        src={project.imageUrl} 
        alt={project.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  };

  const handleLinkClick = async (type: 'demo' | 'github') => {
    if (!project) return;
    try {
      const user = await blink.auth.me();
      await blink.db.project_clicks.create({
        id: crypto.randomUUID(),
        project_id: project.id,
        user_id: user?.id || 'public_visitor',
        click_type: type
      });
      blink.analytics.log('project_click', { projectId: project.id, type });
    } catch (e) { console.error(e); }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
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
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-background rounded-2xl border border-zinc-200 shadow-2xl flex flex-col lg:flex-row"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/80 hover:bg-zinc-100 text-zinc-900 border shadow-sm"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Left Side: Visuals */}
          <div className="w-full lg:w-[60%] h-64 lg:h-auto overflow-hidden bg-zinc-50 border-r relative group">
            {renderMedia()}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 flex gap-3 pointer-events-none">
               <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-zinc-200 shadow-sm flex items-center gap-2">
                 <TheDot size="sm" /> {project.category}
               </span>
               {project.mediaType !== 'image' && (
                 <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20 shadow-sm flex items-center gap-2">
                   {project.mediaType === 'video' ? <Play className="h-3 w-3 fill-current" /> : <Box className="h-3 w-3" />}
                   {project.mediaType?.toUpperCase()}
                 </span>
               )}
            </div>
          </div>

          {/* Right Side: Archive Data */}
          <div className="w-full lg:w-[40%] p-8 lg:p-12 overflow-y-auto bg-white flex flex-col">
            <div className="flex-1">
              <div className="mb-10">
                <div className="text-primary font-bold text-[10px] tracking-[0.25em] uppercase mb-4 flex items-center gap-2">
                  Project Artifact #{project.id.slice(0, 4)}
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-8 leading-[1.1] tracking-tighter">
                  {project.title}
                </h2>
                <div className="prose prose-zinc max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-lg italic">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-8 mb-12 py-8 border-y border-zinc-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Archived</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">2024.05.12</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Type</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">Full Stack Project</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Code className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Tech Stack</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">React, Tailwind, SDK</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Status</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live & Verified
                  </p>
                </div>
              </div>

              {/* Milestones / Timeline */}
              {milestones.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Project Evolution</h3>
                  </div>
                  <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-100">
                    {milestones.map((milestone, idx) => (
                      <div key={milestone.id} className="relative pl-10">
                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-zinc-900">{milestone.title}</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">{milestone.description}</p>
                          {milestone.imageUrl && (
                            <img src={milestone.imageUrl} className="w-full h-32 object-cover rounded-lg border mt-2" alt="" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                {project.githubUrl && (
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl h-14 font-bold gap-2 border-zinc-200" 
                    asChild
                    onClick={() => handleLinkClick('github')}
                  >
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-5 w-5" /> Repository
                    </a>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button 
                    className="flex-1 rounded-xl h-14 font-bold gap-2 shadow-xl shadow-primary/20" 
                    asChild
                    onClick={() => handleLinkClick('demo')}
                  >
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-5 w-5" /> Live Demo
                    </a>
                  </Button>
                )}
                {!project.demoUrl && !project.githubUrl && (
                   <Button className="w-full rounded-xl h-14 font-bold gap-2 shadow-xl shadow-primary/20">
                     Explore Artifact <ArrowRight className="h-5 w-5" />
                   </Button>
                )}
              </div>
              <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-widest">
                Protected by Visual Library Archive Protocol
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
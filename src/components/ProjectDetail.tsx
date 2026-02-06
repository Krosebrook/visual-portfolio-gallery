import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, ArrowRight, Github, Globe, ExternalLink, Code, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TheDot } from './ui/TheDot';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  githubUrl?: string;
  demoUrl?: string;
}

interface ProjectDetailProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  if (!project) return null;

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
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 flex gap-3">
               <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-zinc-200 shadow-sm flex items-center gap-2">
                 <TheDot size="sm" /> {project.category}
               </span>
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
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                {project.githubUrl && (
                  <Button variant="outline" className="flex-1 rounded-xl h-14 font-bold gap-2 border-zinc-200" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-5 w-5" /> Repository
                    </a>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button className="flex-1 rounded-xl h-14 font-bold gap-2 shadow-xl shadow-primary/20" asChild>
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

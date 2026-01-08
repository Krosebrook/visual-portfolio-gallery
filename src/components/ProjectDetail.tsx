import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
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
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 hover:bg-black/80 text-white"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Image Section */}
          <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
            <div className="mb-8">
              <span className="text-primary text-sm font-medium tracking-widest uppercase mb-2 block">{project.category}</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">{project.title}</h2>
              <p className="text-gray-400 leading-relaxed text-lg font-light">
                {project.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12 py-8 border-y border-white/5">
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-medium">Year</span>
                </div>
                <p className="text-white">2024</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-medium">Client</span>
                </div>
                <p className="text-white">Luxury Brand Int.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Tag className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-medium">Role</span>
                </div>
                <p className="text-white">Creative Lead</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button className="w-full rounded-full py-6 text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Live Preview <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="w-full rounded-full py-6 text-lg border-white/10 hover:bg-white/5">
                Share Project
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

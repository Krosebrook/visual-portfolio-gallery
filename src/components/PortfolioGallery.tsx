import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, ExternalLink, Grid, LayoutTemplate, Filter, ArrowRight, BookOpen, Code, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blink } from '@/lib/blink';
import { ProjectDetail } from './ProjectDetail';
import { TheDot } from './ui/TheDot';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  mediaType?: 'image' | 'video' | '3d';
  githubUrl?: string;
  demoUrl?: string;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Digital Ecosystem Archive',
    description: 'A comprehensive visual library of scalable components and design systems built for modern web architectures.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
    category: 'Architecture'
  },
  {
    id: '2',
    title: 'Neural Network Visualizer',
    description: 'Real-time 3D visualization of neural processing pathways, providing deep insights into model decision layers.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    category: 'Technology'
  },
  {
    id: '3',
    title: 'Brand Identity Vault',
    description: 'A secure repository of brand assets, guidelines, and evolutionary snapshots for global enterprise identities.',
    imageUrl: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=2074&auto=format&fit=crop',
    category: 'Branding'
  }
];

export function PortfolioGallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await blink.db.projects.list();
        setProjects(data.length > 0 ? (data as any) : SAMPLE_PROJECTS);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(SAMPLE_PROJECTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  if (loading) return (
    <div className="py-32 w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <>
      <div className="w-full">
        {/* Categories Filter */}
        <div className="flex flex-wrap gap-4 mb-16 border-b border-zinc-100 pb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Library Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-2xl hover:shadow-zinc-200 transition-all duration-500 h-full"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-200">
                      {project.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <TheDot size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-2xl font-serif font-bold tracking-tight line-clamp-1">{project.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-1 line-clamp-3">
                    {project.description}
                  </p>
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase group/link"
                  >
                    Learn More 
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 mb-6">
              <BookOpen className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Library is empty</h3>
            <p className="text-muted-foreground">No archived collections match your filter.</p>
          </div>
        )}
      </div>

      <ProjectDetail 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </>
  );
}

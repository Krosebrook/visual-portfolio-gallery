import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, ExternalLink, Grid, LayoutTemplate, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blink } from '@/lib/blink';
import { ProjectDetail } from './ProjectDetail';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Abstract Architecture',
    description: 'A study of modern architectural forms and their interplay with natural light. This project explores the boundary between functionality and sculpture.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    category: 'Photography'
  },
  {
    id: '2',
    title: 'Oceanic Whispers',
    description: 'A collection of high-fashion editorials inspired by the fluid movement of deep-sea creatures and the iridescent textures of marine life.',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop',
    category: 'Fashion'
  },
  {
    id: '3',
    title: 'Urban Serenity',
    description: 'Finding peace within the chaos of metropolitan life. This series captures moments of stillness and beauty in unexpected city corners.',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop',
    category: 'Editorial'
  }
];

export function PortfolioGallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Derived state
  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  // Handlers
  const next = () => setCurrentIndex((prev) => (prev + 1) % filteredProjects.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  const currentProject = filteredProjects[currentIndex];

  return (
    <>
      <div className={`relative min-h-screen w-full bg-background transition-all duration-700 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        
        {/* Controls Bar (Top) */}
        {!isFullscreen && (
          <div className="absolute top-24 left-0 right-0 z-20 px-8 flex justify-between items-end pointer-events-none">
            {/* Categories */}
            <div className="pointer-events-auto flex gap-6 overflow-x-auto pb-2 max-w-[60%] hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
                    activeCategory === cat ? 'text-primary font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="pointer-events-auto flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setViewMode('slide')}
                className={`p-2 rounded-full transition-all ${viewMode === 'slide' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                <LayoutTemplate className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW MODE: SLIDE --- */}
        {viewMode === 'slide' && currentProject && (
          <div className="relative h-screen w-full overflow-hidden">
             {/* Background Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProject.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={currentProject.imageUrl}
                  alt={currentProject.title}
                  className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
              </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24 pointer-events-none">
              <motion.div
                key={`content-${currentProject.id}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="max-w-2xl pointer-events-auto"
              >
                <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-widest uppercase bg-primary text-primary-foreground rounded-full">
                  {currentProject.category}
                </span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl mb-6 text-white leading-tight font-serif">
                  {currentProject.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-xl font-light">
                  {currentProject.description}
                </p>
                <div className="flex gap-4">
                  <Button 
                    variant="default" 
                    className="rounded-full px-8 py-6 text-lg group"
                    onClick={() => setSelectedProject(currentProject)}
                  >
                    View Project <ExternalLink className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full w-14 h-14 border-white/20 hover:bg-white/10"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <X /> : <Maximize2 />}
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 md:bottom-16 md:right-16 flex gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-12 h-12 md:w-16 md:h-16 border-white/20 text-white hover:bg-white/10 transition-all active:scale-95"
                onClick={prev}
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-12 h-12 md:w-16 md:h-16 border-white/20 text-white hover:bg-white/10 transition-all active:scale-95"
                onClick={next}
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </div>

            {/* Pagination Indicator */}
            <div className="absolute top-32 right-8 md:right-16 flex flex-col items-end gap-2 text-white/50">
              <span className="text-white text-4xl font-serif">{(currentIndex + 1).toString().padStart(2, '0')}</span>
              <div className="w-px h-12 bg-white/20" />
              <span className="text-sm tracking-widest uppercase">{filteredProjects.length.toString().padStart(2, '0')}</span>
            </div>
          </div>
        )}

        {/* --- VIEW MODE: GRID --- */}
        {viewMode === 'grid' && (
          <div className="pt-48 pb-24 px-8 md:px-16 min-h-screen">
             <motion.div 
               layout 
               className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
             >
               <AnimatePresence>
                 {filteredProjects.map((project) => (
                   <motion.div
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ duration: 0.4 }}
                     key={project.id}
                     className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer"
                     onClick={() => setSelectedProject(project)}
                   >
                     <img 
                       src={project.imageUrl} 
                       alt={project.title} 
                       className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                        <span className="text-primary text-xs uppercase tracking-widest mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">{project.category}</span>
                        <h3 className="text-2xl font-serif text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-200">{project.title}</h3>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </motion.div>
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

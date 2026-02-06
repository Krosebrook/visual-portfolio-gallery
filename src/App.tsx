import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { PortfolioGallery } from './components/PortfolioGallery';
import { Testimonials } from './components/Testimonials';
import { ContactSection } from './components/ContactSection';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, ArrowRight, Settings, LogOut, User as UserIcon, Menu, Github, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { AdminPanel } from './components/AdminPanel';
import { blink } from './lib/blink';
import { useEffect, useState, useRef } from 'react';
import { LibraryHero } from './components/LibraryHero';
import { TheDot } from './components/ui/TheDot';
import ProofingPortal from './components/ProofingPortal';

function Navbar({ onAdminOpen }: { onAdminOpen: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    return blink.auth.onAuthStateChanged(({ user }) => setUser(user));
  }, []);

  useEffect(() => {
    return scrollY.onChange((latest) => setIsScrolled(latest > 50));
  }, [scrollY]);

  if (!isHome) return null;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-xl border-b py-4 shadow-sm' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="text-2xl font-serif font-bold tracking-tighter flex items-center gap-1">
            LIBRARY<span className="text-primary italic">01</span>
            <TheDot size="sm" className="mb-1" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex gap-10 text-[13px] uppercase tracking-widest font-bold"
        >
          <a href="#collection" className="hover:text-primary transition-colors flex items-center gap-1.5">
            Collection
          </a>
          <a href="#services" className="hover:text-primary transition-colors flex items-center gap-1.5">
            About
          </a>
          <a href="#testimonials" className="hover:text-primary transition-colors flex items-center gap-1.5">
            Testimonials
          </a>
          <a href="#contact" className="hover:text-primary transition-colors flex items-center gap-1.5">
            Contact
          </a>
        </motion.div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onAdminOpen}
                className="rounded-full hover:bg-primary/10 hover:text-primary"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => blink.auth.logout()}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              onClick={() => blink.auth.login()}
              className="rounded-full px-6 font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20"
            >
              Sign In
            </Button>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="py-32 bg-zinc-950 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-32">
          <div>
            <div className="text-primary font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
              <TheDot size="sm" /> Get in touch
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-10 leading-[0.95] tracking-tighter">
              Ready to Archive <br />
              <span className="text-primary italic">Your Legacy?</span>
            </h2>
            <Button variant="link" className="text-2xl p-0 h-auto group text-white hover:text-primary transition-all underline decoration-primary/30 decoration-2 underline-offset-8">
              Start an intake <ArrowRight className="ml-3 h-8 w-8 transition-transform group-hover:translate-x-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-6">HQ</h4>
                <p className="text-xl font-medium leading-snug text-zinc-300">
                  Global Digital Archive<br />
                  Distributed Presence
                </p>
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-6">Contact</h4>
                <a href="mailto:library@visual.com" className="text-xl font-medium hover:text-primary transition-colors text-zinc-300">
                  library@visual.com
                </a>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-6">Follow</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
                    <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
                    <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
                    <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-6">Newsletter</h4>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <Button size="icon" className="rounded-full w-10 h-10">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-serif font-bold tracking-tighter flex items-center gap-1 opacity-50">
            LIBRARY<span className="text-primary italic">01</span>
            <TheDot size="sm" className="mb-1" />
          </div>
          <div className="flex gap-10 text-[11px] uppercase tracking-widest font-bold text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
          <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-600">
            &copy; {new Date().getFullYear()} Archive Visual. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Home({ onAdminOpen, refreshKey }: { onAdminOpen: () => void, refreshKey: number }) {
  return (
    <>
      <LibraryHero />

      <section id="collection" className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div>
              <div className="text-primary font-bold text-xs tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <TheDot size="sm" /> Project Library
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter">
                Archived <br />
                <span className="text-primary italic">Collections</span>
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-md">
              Browse through our curated selection of digital artifacts, code bases, and visual experiments.
            </p>
          </div>
          <PortfolioGallery key={refreshKey} />
        </div>
      </section>

      <section id="testimonials" className="bg-zinc-50 border-y py-32">
        <div className="max-w-7xl mx-auto px-8">
          <Testimonials />
        </div>
      </section>

      <ContactSection />
    </>
  );
}

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-background">
      <Navbar onAdminOpen={() => setIsAdminOpen(true)} />
      
      <Routes>
        <Route path="/" element={<Home onAdminOpen={() => setIsAdminOpen(true)} refreshKey={refreshKey} />} />
        <Route path="/proofing/:projectId" element={<ProofingPortal />} />
      </Routes>

      <Footer />
      <Toaster position="bottom-right" richColors />
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onProjectAdded={() => setRefreshKey(prev => prev + 1)} 
      />
    </main>
  );
}

import React from 'react';
import { PortfolioGallery } from './components/PortfolioGallery';
import { Testimonials } from './components/Testimonials';
import { ContactSection } from './components/ContactSection';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Mail, ArrowRight, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { AdminPanel } from './components/AdminPanel';
import { blink } from './lib/blink';
import { useEffect, useState } from 'react';

function Navbar({ onAdminOpen }: { onAdminOpen: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    return blink.auth.onAuthStateChanged(({ user }) => setUser(user));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-8 py-6 flex justify-between items-center bg-transparent">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-serif font-bold tracking-tighter"
      >
        VISUAL<span className="text-primary">PORTFOLIO</span>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-medium text-white/70"
      >
        <a href="#gallery" className="hover:text-primary transition-colors">Showcase</a>
        <a href="#about" className="hover:text-primary transition-colors">About</a>
        <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
      </motion.div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onAdminOpen}
              className="rounded-full text-white/70 hover:text-primary"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => blink.auth.logout()}
              className="rounded-full text-white/70 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => blink.auth.login()}
            className="rounded-full border-primary/20 hover:bg-primary/10"
          >
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="py-24 px-8 md:px-16 lg:px-24 bg-black border-t border-white/5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24">
        <div>
          <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
            Have a vision in mind? <br />
            <span className="text-primary">Let's build it together.</span>
          </h2>
          <Button variant="link" className="text-xl p-0 h-auto group text-white hover:text-primary transition-colors">
            Start a project <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
          </Button>
        </div>
        <div className="flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Location</h4>
              <p className="text-lg">Based in London,<br />Available worldwide</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2 rounded-full border border-white/10 hover:border-primary transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="p-2 rounded-full border border-white/10 hover:border-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="p-2 rounded-full border border-white/10 hover:border-primary transition-colors"><Mail className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-12">
            &copy; {new Date().getFullYear()} Visual Portfolio Gallery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-background">
      <Navbar onAdminOpen={() => setIsAdminOpen(true)} />
      
      <section id="gallery">
        <PortfolioGallery key={refreshKey} />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <ContactSection />

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
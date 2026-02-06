import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TheDot } from './ui/TheDot';
import { PressKitGenerator } from './PressKitGenerator';
import { blink } from '@/lib/blink';
import { Link } from 'react-router-dom';

export function LibraryHero() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    return blink.auth.onAuthStateChanged(({ user }) => setUser(user));
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden bg-background">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="max-w-5xl w-full relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-8 border border-primary/10"
        >
          <Sparkles className="w-3 h-3" />
          Personal Project Archive
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tighter leading-[0.9] mb-8"
        >
          Visual Library <br />
          You Can <span className="text-primary italic">Trust</span>
          <TheDot size="md" className="ml-2 mb-2 align-baseline" />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          An immersive archive of code, design, and documentation. 
          Elegantly preserved for the future of building.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <a href="#collection">
            <Button size="lg" className="rounded-full px-8 h-14 text-lg group bg-primary hover:bg-primary/90">
              Explore Collection
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
          {user ? (
            <Link to="/admin">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-primary/20 hover:bg-primary/5 text-primary">
                <LayoutDashboard className="mr-2 w-5 h-5" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <PressKitGenerator />
          )}
        </motion.div>
      </div>

      {/* Floating Motifs */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-[10%] hidden lg:block"
      >
        <div className="w-24 h-24 border-2 border-primary/20 rounded-2xl flex items-center justify-center">
          <TheDot size="sm" />
        </div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-[10%] hidden lg:block"
      >
        <div className="w-16 h-16 border-2 border-primary/10 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-primary/40 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
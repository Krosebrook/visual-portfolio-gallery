import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { blink } from '@/lib/blink';
import { TheDot } from './ui/TheDot';

interface Testimonial {
  id: string;
  clientName: string;
  content: string;
  clientRole: string;
  clientImage?: string;
}

const sampleTestimonials: Testimonial[] = [
  {
    id: '1',
    clientName: 'Elena Richardson',
    clientRole: 'Head of Archives, Digital Heritage',
    content: "The Visual Library system has redefined how we preserve our technical milestones. The automated asset generation is simply unparalleled in the industry."
  },
  {
    id: '2',
    clientName: 'Marcus Thorne',
    clientRole: 'CTO, Legacy Systems',
    content: "A masterpiece of digital organization. Every project is archived with such precision that it feels like visiting a physical museum of code and design."
  },
  {
    id: '3',
    clientName: 'Sophie Chen',
    clientRole: 'Founding Partner, Artifacts Co.',
    content: "The aesthetic matching of intinc.com brings a level of professionalism that makes our internal archives client-ready from day one. Truly exceptional work."
  }
];

export function Testimonials() {
  const [testimonials, setTestimonials] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await blink.db.testimonials.list();
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(sampleTestimonials);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials', error);
        setTestimonials(sampleTestimonials);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="bg-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <div className="text-primary font-bold text-[10px] tracking-[0.25em] uppercase mb-4 flex items-center justify-center gap-2">
            <TheDot size="sm" /> Archive Feedback
          </div>
          <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tighter mb-6">
            Curator <span className="text-primary italic">Voices</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            Insights from technical leaders and archivists who utilize our visual library for preserving digital legacy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative group p-10 rounded-2xl bg-white border border-zinc-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500"
            >
              <div className="flex gap-1 mb-6 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-zinc-600 text-lg mb-8 leading-relaxed italic font-medium">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center font-serif text-primary font-bold text-lg">
                  {testimonial.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 leading-none mb-1.5">{testimonial.clientName}</h4>
                  <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold">{testimonial.clientRole}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

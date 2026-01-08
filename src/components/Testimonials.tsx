import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { blink } from '@/lib/blink';

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
    clientRole: 'Creative Director, Vogue',
    content: "An exceptional eye for detail and a unique perspective that brings every project to life. Working together was a seamless and inspiring experience."
  },
  {
    id: '2',
    clientName: 'Marcus Thorne',
    clientRole: 'CEO, Horizon Tech',
    content: "The visual storytelling transformed our brand identity. The portfolio gallery is a testament to true craftsmanship and artistic vision."
  },
  {
    id: '3',
    clientName: 'Sophie Chen',
    clientRole: 'Independent Curator',
    content: "Capturing the essence of urban stillness in a way I've never seen before. A masterful display of photography and design integration."
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
    <section className="py-24 px-8 md:px-16 lg:px-24 bg-background border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Client Voices</h2>
          <p className="text-muted-foreground max-w-md">What others say about my creative journey and collaborations.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500"
            >
              <Quote className="absolute -top-4 -left-4 h-12 w-12 text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
              <p className="text-lg mb-8 leading-relaxed font-light italic">
                "{testimonial.content}"
              </p>
              <div>
                <h4 className="font-medium text-white">{testimonial.clientName}</h4>
                <p className="text-sm text-primary/80">{testimonial.clientRole}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

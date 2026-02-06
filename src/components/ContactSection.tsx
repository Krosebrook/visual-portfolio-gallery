import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Mail, Phone, MapPin, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { blink } from '@/lib/blink';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TheDot } from './ui/TheDot';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const [loading, setLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    try {
      const inquiryId = crypto.randomUUID();
      const userId = (await blink.auth.me())?.id || 'anonymous_public';

      await blink.db.inquiries.create({
        id: inquiryId,
        ...data,
        userId: userId,
      });

      blink.analytics.log('inquiry_submitted', {
        name: data.name,
        email: data.email,
        subject: data.subject
      });

      toast.success('Archive request sent successfully!');
      form.reset();
    } catch (error) {
      console.error('Contact error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 px-8 bg-zinc-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -z-10 opacity-50" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary/5 blur-[100px] -z-10 opacity-50" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Info Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-primary font-bold text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-2">
            <TheDot size="sm" /> Library Intake
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-[0.95] tracking-tighter">
            Contribute to <br />
            <span className="text-primary italic">The Archive.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-md leading-relaxed">
            Have a project that deserves a place in our visual library? Send us the details and our automated curators will begin the intake process.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center group-hover:border-primary/30 transition-colors shadow-sm">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Archive Email</h4>
                <p className="text-xl font-bold text-zinc-900">intake@visual-library.com</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center group-hover:border-primary/30 transition-colors shadow-sm">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Global Presence</h4>
                <p className="text-xl font-bold text-zinc-900">Distributed & Peer-Verified</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Column */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white border border-zinc-200 p-8 md:p-12 rounded-3xl shadow-2xl shadow-zinc-200/50 relative"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="h-14 bg-zinc-50 border-zinc-200 focus:border-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} className="h-14 bg-zinc-50 border-zinc-200 focus:border-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Project Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Open Source Tool" {...field} className="h-14 bg-zinc-50 border-zinc-200 focus:border-primary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Artifact Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide GitHub links or project descriptions..." 
                        {...field} 
                        className="bg-zinc-50 border-zinc-200 focus:border-primary/50 min-h-[150px] resize-none" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Submit for Archive
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  );
}

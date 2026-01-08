import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { blink } from '@/lib/blink';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
      // 1. Get current user (or system user ID for public inquiries)
      // For public inquiries, we might not have a logged-in user.
      // However, the DB requires user_id.
      // We'll try to get the current user, or use a "public_inquiry" placeholder if allowed by rules,
      // OR better: In a real app, we'd have a public API.
      // Here, assuming the 'db' module is public for creates or we use a hardcoded ID for now if not logged in.
      // Since the security policy shows "db: { require_auth: false }", public creation is allowed.
      // But we need a user_id. We'll generate a random session ID or use 'anonymous'.
      
      const inquiryId = crypto.randomUUID();
      const userId = (await blink.auth.me())?.id || 'anonymous_public';

      // 2. Save to Database
      await blink.db.inquiries.create({
        id: inquiryId,
        ...data,
        userId: userId,
      });

      // 3. Send Email Notification (to the site owner)
      // Ideally this goes to the project owner's email.
      // We'll simulate this or send to the provided email as a confirmation for now.
      // In a real scenario, we'd send to "admin@portfolio.com"
      
      // Sending confirmation to the user
      await blink.notifications.email({
        to: data.email,
        subject: `We received your message: ${data.subject}`,
        html: `
          <h1>Hi ${data.name},</h1>
          <p>Thanks for reaching out! We've received your message and will get back to you shortly.</p>
          <hr />
          <p><strong>Your Message:</strong></p>
          <p>${data.message}</p>
        `,
        text: `Hi ${data.name},\n\nThanks for reaching out! We've received your message.\n\nYour Message:\n${data.message}`
      });

      toast.success('Message sent successfully!');
      form.reset();
    } catch (error) {
      console.error('Contact error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-8 md:px-16 lg:px-24 bg-background border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary/5 blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Info Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
            Let's start a <br />
            <span className="text-primary">conversation.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-md leading-relaxed">
            Interested in working together? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white/5 border border-white/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-1">Email</h4>
                <p className="text-xl">hello@visualportfolio.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white/5 border border-white/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-1">Phone</h4>
                <p className="text-xl">+1 (555) 000-0000</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white/5 border border-white/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-1">Studio</h4>
                <p className="text-xl">123 Creative Ave,<br />London, UK</p>
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
          className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-3xl"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-black/20 border-white/10 focus:border-primary/50 h-12" />
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
                      <FormLabel className="text-white/80">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} className="bg-black/20 border-white/10 focus:border-primary/50 h-12" />
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
                    <FormLabel className="text-white/80">Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Project Inquiry" {...field} className="bg-black/20 border-white/10 focus:border-primary/50 h-12" />
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
                    <FormLabel className="text-white/80">Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell me about your project..." 
                        {...field} 
                        className="bg-black/20 border-white/10 focus:border-primary/50 min-h-[150px] resize-none" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                Send Message
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  );
}

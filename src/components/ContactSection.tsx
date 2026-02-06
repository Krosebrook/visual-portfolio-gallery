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
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [isClarifying, setIsClarifying] = useState(false);
  const [originalData, setOriginalData] = useState<ContactFormValues | null>(null);

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
    
    // Smart Ambiguity Check
    if (!isClarifying) {
      try {
        const checkResult = await blink.ai.generateObject({
          schema: {
            type: 'object',
            properties: {
              isAmbiguous: { type: 'boolean' },
              questions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 }
            },
            required: ['isAmbiguous', 'questions']
          },
          prompt: `Analyze this archive request message for ambiguity or lack of detail. 
          Subject: ${data.subject}
          Message: ${data.message}
          
          If the message is very short or vague, mark isAmbiguous: true and provide 3-6 specific clarifying questions to help the creator understand the project better.`
        });

        if (checkResult.object.isAmbiguous) {
          setClarificationQuestions(checkResult.object.questions);
          setIsClarifying(true);
          setOriginalData(data);
          setLoading(false);
          toast.info('Help us understand your request better with a few more details.');
          return;
        }
      } catch (e) {
        console.error('Ambiguity check failed, proceeding');
      }
    }

    try {
      const inquiryId = crypto.randomUUID();
      const userId = (await blink.auth.me())?.id || 'anonymous_public';

      // Combine original message with answers
      let enrichedMessage = data.message;
      if (Object.keys(clarificationAnswers).length > 0) {
        enrichedMessage += "\n\n--- Additional Context ---\n";
        Object.entries(clarificationAnswers).forEach(([q, a]) => {
          if (a) enrichedMessage += `Q: ${q}\nA: ${a}\n`;
        });
      }

      await blink.db.inquiries.create({
        id: inquiryId,
        ...data,
        message: enrichedMessage,
        userId: userId,
      });

      blink.analytics.log('inquiry_submitted', {
        name: data.name,
        email: data.email,
        subject: data.subject
      });

      toast.success('Archive request sent successfully!');
      form.reset();
      setIsClarifying(false);
      setClarificationQuestions([]);
      setClarificationAnswers({});
      setOriginalData(null);
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
          
          {isClarifying && clarificationQuestions.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold">A few more details...</h3>
                <p className="text-muted-foreground">To help us process your archive request effectively, please answer these quick questions.</p>
              </div>

              <div className="space-y-6">
                {clarificationQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{q}</label>
                    <Textarea 
                      placeholder="Your answer..."
                      value={clarificationAnswers[q] || ''}
                      onChange={(e) => setClarificationAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                      className="bg-zinc-50 border-zinc-200 focus:border-primary/50 min-h-[80px]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl"
                  onClick={() => {
                    setIsClarifying(false);
                    setClarificationQuestions([]);
                    setClarificationAnswers({});
                  }}
                >
                  Back
                </Button>
                <Button 
                  className="flex-[2] h-14 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20"
                  onClick={() => originalData && onSubmit(originalData)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                  Complete Submission
                </Button>
              </div>
            </div>
          ) : (
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
          )}
        </motion.div>
      </div>
    </section>
  );
}

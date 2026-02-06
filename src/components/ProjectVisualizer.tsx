import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Loader2, Download, Maximize2, Workflow, Layers, CalendarRange, Share2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Visual {
  id: string;
  url: string;
  visual_type: string;
  prompt: string;
  created_at: string;
}

interface ProjectVisualizerProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
}

const VISUAL_TYPES = [
  { id: 'infographic', label: 'Infographic', icon: ImageIcon, example: 'Generate a professional infographic of the project metrics and key achievements.' },
  { id: 'user_flow', label: 'User Flow', icon: Workflow, example: 'Generate a user flow for the checkout process' },
  { id: 'architecture', label: 'Architecture', icon: Layers, example: 'Create an architecture diagram for the user service' },
  { id: 'gantt', label: 'Gantt Chart', icon: CalendarRange, example: 'Generate a Gantt chart for the project development phases' },
  { id: 'mindmap', label: 'Mindmap', icon: Lightbulb, example: 'Create a mindmap of the project features and user needs' },
];

export function ProjectVisualizer({ projectId, projectTitle, projectDescription }: ProjectVisualizerProps) {
  const [visuals, setVisuals] = useState<Visual[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('infographic');

  useEffect(() => {
    fetchVisuals();
  }, [projectId]);

  const fetchVisuals = async () => {
    try {
      const data = await blink.db.project_visuals.list({
        where: { project_id: projectId },
        orderBy: { created_at: 'desc' }
      });
      setVisuals(data as any);
    } catch (error) {
      console.error('Error fetching visuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error('Please enter a prompt');
    
    setIsGenerating(true);
    try {
      const user = await blink.auth.me();
      if (!user) {
        toast.error('Please sign in to generate visuals');
        return;
      }

      const visualType = VISUAL_TYPES.find(t => t.id === selectedType);
      
      const generationPrompt = `Generate a high-quality, professional ${visualType?.label} for a project titled "${projectTitle}".
      Context: ${projectDescription}
      User Request: ${prompt}
      Style: Clean, minimalist, corporate aesthetic, architecturally inspired, professional diagrams.
      Ensure all text in the diagram is legible and professionally formatted.`;

      const images = await blink.ai.generateImage({
        prompt: generationPrompt,
        model: 'fal-ai/nano-banana-pro',
        n: 1
      });

      const newVisual = {
        id: crypto.randomUUID(),
        project_id: projectId,
        visual_type: selectedType,
        url: images[0],
        prompt: prompt,
        user_id: user.id
      };

      await blink.db.project_visuals.create(newVisual);
      setVisuals(prev => [newVisual as any, ...prev]);
      setPrompt('');
      toast.success(`${visualType?.label} generated successfully!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate visual');
    } finally {
      setIsGenerating(false);
    }
  };

  const useExample = (example: string) => {
    setPrompt(example);
  };

  if (loading) return <div className="py-12 text-center text-zinc-400">Loading library visuals...</div>;

  return (
    <div className="space-y-8">
      {/* Generator Section */}
      <Card className="p-6 border-zinc-200 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Artifact Visual Generator</h4>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 px-1">Visual Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="rounded-xl border-zinc-200 bg-zinc-50/50">
                  <SelectValue placeholder="Select diagram type" />
                </SelectTrigger>
                <SelectContent>
                  {VISUAL_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 px-1">Custom Prompt</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Describe what you want to visualize..." 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="rounded-xl bg-zinc-50/50 border-zinc-200 h-12"
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="rounded-xl h-12 px-6 gap-2 font-bold"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 py-1.5 px-1">Try Examples:</span>
            {VISUAL_TYPES.map(type => (
              <Button 
                key={type.id}
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedType(type.id);
                  useExample(type.example);
                }}
                className="rounded-full text-[10px] font-bold uppercase tracking-widest border-zinc-200 h-7"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Visuals Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visuals.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <ImageIcon className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-sm text-zinc-400 font-medium">No generated visuals yet.</p>
            <p className="text-xs text-zinc-400 mt-1">Prompt the AI above to create diagrams and infographics.</p>
          </div>
        ) : (
          visuals.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden bg-zinc-100">
                <img src={v.url} alt={v.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button variant="white" size="icon" className="rounded-full" onClick={() => window.open(v.url, '_blank')}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="white" size="icon" className="rounded-full" asChild>
                    <a href={v.url} download={`visual-${v.id}.png`}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <Badge className="absolute top-4 left-4 rounded-full bg-white/90 text-zinc-900 backdrop-blur-sm border-none shadow-sm uppercase text-[10px] font-bold tracking-widest">
                  {VISUAL_TYPES.find(t => t.id === v.visual_type)?.label || v.visual_type}
                </Badge>
              </div>
              <div className="p-4 bg-white border-t">
                <p className="text-xs text-zinc-500 line-clamp-1 italic">"{v.prompt}"</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                    {new Date(v.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-zinc-400 hover:text-primary">
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

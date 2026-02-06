import React, { useState } from 'react';
import { Github, Globe, Loader2, Sparkles, Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';

interface IntakeFlowProps {
  onProjectAdded: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function IntakeFlow({ onProjectAdded, loading, setLoading }: IntakeFlowProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [projectForm, setProjectForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    imageUrl: '',
    githubUrl: '',
    demoUrl: '',
    mediaType: 'image' as 'image' | 'video' | '3d',
    videoUrl: '',
    modelUrl: '',
    tags: ''
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      );
      setProjectForm(prev => ({ ...prev, imageUrl: publicUrl }));
      toast.success('Image uploaded!');

      // Vision Analysis for Tagging
      toast.info('Analyzing image for smart tags...');
      const visionResult = await blink.ai.generateText({
        prompt: `Analyze this image URL: ${publicUrl}. 
        Provide a list of 5 professional descriptive tags (comma-separated) that describe the visual style, colors, and content.
        Focus on design aesthetics (e.g., "Minimalist", "High-contrast", "Geometric", "Vibrant").`
      });
      setProjectForm(prev => ({ ...prev, tags: visionResult }));
    } catch (error) {
      toast.error('Upload or analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIntakeGeneration = async () => {
    if (!projectForm.githubUrl && !projectForm.demoUrl) {
      return toast.error('Please provide a URL to analyze');
    }

    setIsGenerating(true);
    try {
      const result = await blink.ai.generateObject({
        schema: {
          title: 'string',
          description: 'string',
          category: 'string',
          suggestedImagePrompt: 'string',
          mediaType: 'string',
          videoUrl: 'string',
          tags: 'string[]'
        },
        prompt: `Analyze this project URL: ${projectForm.githubUrl || projectForm.demoUrl}. 
        Provide a professional title, a compelling 3-sentence description for a visual library, 
        and a broad category (e.g., Technology, Design, Fintech, Social). 
        Also suggest a DALL-E style prompt for a high-quality abstract background image representing this project.
        Determine if this project would benefit from a video showcase (if it's an app or highly interactive) and suggest a media type ('image', 'video').
        Provide 3-5 relevant descriptive tags (e.g., "Minimalist", "React", "Visual", "Data-driven").`
      });

      const { title, description, category, suggestedImagePrompt, mediaType, videoUrl, tags } = result as any;

      const images = await blink.ai.generateImage({
        prompt: suggestedImagePrompt + " -- High quality, architectural, clean, professional aesthetic.",
        n: 1
      });

      setProjectForm(prev => ({
        ...prev,
        title,
        description,
        category,
        imageUrl: images[0],
        mediaType: mediaType || 'image',
        videoUrl: videoUrl || '',
        tags: Array.isArray(tags) ? tags.join(', ') : ''
      }));

      toast.success('Project assets generated successfully!');
    } catch (error) {
      toast.error('Failed to generate assets');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) return blink.auth.login();

      await blink.db.projects.create({ 
        ...projectForm, 
        userId: user.id,
        tags: projectForm.tags // Ensure tags are sent
      });
      toast.success('Project added to library');
      setProjectForm({ title: '', description: '', category: '', imageUrl: '', githubUrl: '', demoUrl: '', mediaType: 'image', videoUrl: '', modelUrl: '', tags: '' });
      onProjectAdded();
    } catch (error) {
      toast.error('Failed to archive project');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalSync = async () => {
    if (!syncUrl) return toast.error('Please provide a Behance or Dribbble URL');
    setIsSyncing(true);
    try {
      const { data, error } = await blink.functions.invoke('behance-sync', {
        body: { url: syncUrl }
      });
      
      if (error) throw new Error(error);
      
      if (data.projects && data.projects.length > 0) {
        // For simplicity, we just load the first one into the form
        const project = data.projects[0];
        setProjectForm(prev => ({
          ...prev,
          title: project.title,
          description: project.description,
          category: project.category,
          imageUrl: project.imageUrl,
          demoUrl: project.demoUrl || syncUrl
        }));
        toast.success(`Extracted ${data.projects.length} projects. Loaded the first one.`);
      } else {
        toast.error('No projects found at this URL');
      }
    } catch (error) {
      toast.error('Failed to sync external portfolio');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">
      <div className="mb-10">
        <h3 className="text-3xl font-serif font-bold mb-4 flex items-center gap-2">
          Archive New Work
        </h3>
        <p className="text-muted-foreground text-lg">
          Provide a repository or demo link. Our system will analyze the source, generate documentation snapshots, and create visual assets for your library.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-zinc-50 border rounded-2xl p-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <ExternalLink className="h-3 w-3" /> Sync External Portfolio
            </label>
            <div className="flex gap-2">
              <Input 
                placeholder="Behance / Dribbble URL" 
                value={syncUrl}
                onChange={e => setSyncUrl(e.target.value)}
                className="h-10 bg-white"
              />
              <Button 
                onClick={handleExternalSync} 
                disabled={isSyncing || loading}
                className="h-10 px-4"
                variant="secondary"
              >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                {isSyncing ? '' : 'Sync'}
              </Button>
            </div>
            <p className="text-[10px] text-zinc-400">Import projects directly from Behance or Dribbble</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Source URLs</label>
            <div className="space-y-3">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="GitHub Repository URL" 
                  value={projectForm.githubUrl}
                  onChange={e => setProjectForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                  className="pl-10 h-12 bg-zinc-50 border-zinc-200"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="Demo / Live URL" 
                  value={projectForm.demoUrl}
                  onChange={e => setProjectForm(prev => ({ ...prev, demoUrl: e.target.value }))}
                  className="pl-10 h-12 bg-zinc-50 border-zinc-200"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleIntakeGeneration} 
            disabled={isGenerating || loading}
            className="w-full h-14 rounded-xl text-lg font-bold gap-2 shadow-xl shadow-primary/10"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {isGenerating ? 'Analyzing Source...' : 'Generate Library Assets'}
          </Button>

          <div className="pt-6 border-t border-zinc-100">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-4">Manual Override</label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Media Type</label>
                  <select 
                    value={projectForm.mediaType}
                    onChange={e => setProjectForm(prev => ({ ...prev, mediaType: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-md bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="3d">3D Model</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Archive Category</label>
                  <Input 
                    placeholder="e.g. Fintech" 
                    value={projectForm.category}
                    onChange={e => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>

              {projectForm.mediaType === 'video' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Video Source URL (YouTube/Vimeo/Direct)</label>
                  <Input 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={projectForm.videoUrl}
                    onChange={e => setProjectForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="bg-zinc-50 border-zinc-200"
                  />
                </div>
              )}

              {projectForm.mediaType === '3d' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Model URL (.glb/.gltf)</label>
                  <Input 
                    placeholder="https://example.com/model.glb" 
                    value={projectForm.modelUrl}
                    onChange={e => setProjectForm(prev => ({ ...prev, modelUrl: e.target.value }))}
                    className="bg-zinc-50 border-zinc-200"
                  />
                </div>
              )}

              <Input 
                placeholder="Archive Title" 
                value={projectForm.title}
                onChange={e => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                className="bg-zinc-50 border-zinc-200"
              />
              <Textarea 
                placeholder="Project Description" 
                value={projectForm.description}
                onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-zinc-50 border-zinc-200 min-h-[120px]"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Smart Tags (comma separated)</label>
                <Input 
                  placeholder="e.g. React, Minimalist, Data" 
                  value={projectForm.tags}
                  onChange={e => setProjectForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-zinc-50 border-zinc-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="aspect-video bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden group relative">
            {projectForm.imageUrl ? (
              <>
                <img src={projectForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" onClick={() => setProjectForm(prev => ({ ...prev, imageUrl: '' }))}>Replace</Button>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-sm text-zinc-400 font-medium">Asset Preview Area</p>
                <p className="text-xs text-zinc-400 mt-1">Images will appear here after analysis</p>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="manual-upload"
                  onChange={(e) => handleImageUpload(e.target.files?.[0]!)}
                />
                <Button variant="ghost" size="sm" className="mt-4" asChild>
                  <label htmlFor="manual-upload" className="cursor-pointer">Upload Manually</label>
                </Button>
              </div>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">System Insights</h4>
            <p className="text-sm text-zinc-600 leading-relaxed italic">
              {isGenerating 
                ? "Our AI is currently examining the code structure and live behavior to extract key features..." 
                : projectForm.title 
                  ? `Ready to archive "${projectForm.title}". All assets have been curated for visual consistency.`
                  : "Awaiting project input. We recommend starting with a GitHub URL for best documentation extraction."}
            </p>
          </div>

          <Button 
            onClick={createProject} 
            disabled={loading || !projectForm.title || !projectForm.imageUrl}
            className="w-full h-14 rounded-xl text-lg font-bold gap-2 bg-zinc-950 hover:bg-zinc-900 shadow-xl shadow-black/5"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Archive to Library
          </Button>
        </div>
      </div>
    </div>
  );
}

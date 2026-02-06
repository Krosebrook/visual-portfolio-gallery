import React, { useState } from 'react';
import { Github, Globe, Loader2, Sparkles, Image as ImageIcon, RefreshCw, Search, CheckCircle2, ExternalLink, Upload, FileArchive, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { CREATIVE_CONNECTORS, type CreativeArtifact } from '@/lib/connectors';

interface IntakeFlowProps {
  onProjectAdded: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onTabChange?: (tab: string) => void;
}

export function IntakeFlow({ onProjectAdded, loading, setLoading, onTabChange }: IntakeFlowProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<CreativeArtifact>(CREATIVE_CONNECTORS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSavedProject, setLastSavedProject] = useState<any>(null);
  
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
    tags: '',
    auditData: null as any,
    zipUrl: ''
  });

  // Core save function - saves project to database
  const saveProjectToDb = async (formData: typeof projectForm): Promise<any> => {
    const user = await blink.auth.me();
    if (!user) {
      blink.auth.login(window.location.origin + '/admin');
      return null;
    }

    if (!formData.title || !formData.imageUrl) {
      toast.error('Missing required fields (title or image). Please fill them in and save manually.');
      return null;
    }

    const project = await blink.db.projects.create({ 
      title: formData.title,
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl,
      mediaType: formData.mediaType,
      videoUrl: formData.videoUrl,
      modelUrl: formData.modelUrl,
      tags: formData.tags,
      zipUrl: formData.zipUrl,
      userId: user.id,
    });

    // Save audit if available
    const auditData = formData.auditData;
    if (auditData && project) {
      try {
        await blink.db.projectAudits.create({
          projectId: project.id,
          auditType: auditData.auditType || 'Professional Portfolio Audit',
          score: auditData.score,
          findings: auditData.findings,
          recommendations: auditData.recommendations,
          userId: user.id,
        });
      } catch (e) {
        console.error('Audit save failed:', e);
      }
    }

    return project;
  };

  const resetForm = () => {
    setProjectForm({ 
      title: '', description: '', category: '', imageUrl: '', githubUrl: '', 
      demoUrl: '', mediaType: 'image', videoUrl: '', modelUrl: '', tags: '', 
      auditData: null, zipUrl: '' 
    });
    setZipFile(null);
    setSyncUrl('');
    setDeployedUrl('');
  };

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

      toast.info('Analyzing image for smart tags...');
      const visionResult = await blink.ai.generateText({
        prompt: `Analyze this image URL: ${publicUrl}. 
        Provide a list of 5 professional descriptive tags (comma-separated) that describe the visual style, colors, and content.
        Focus on design aesthetics (e.g., "Minimalist", "High-contrast", "Geometric", "Vibrant").`
      });
      const tagsText = typeof visionResult === 'string' ? visionResult : String(visionResult);
      setProjectForm(prev => ({ ...prev, tags: tagsText }));
    } catch (error) {
      toast.error('Upload or analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIntakeGenerationWithUrls = async (githubUrlOverride?: string, demoUrlOverride?: string) => {
    const githubUrl = githubUrlOverride ?? projectForm.githubUrl;
    const demoUrl = demoUrlOverride ?? projectForm.demoUrl;

    if (!githubUrl && !demoUrl && !zipFile) {
      return toast.error('Please provide a URL or ZIP file to analyze');
    }

    setIsGenerating(true);
    setLastSavedProject(null);
    let uploadedZipUrl = '';

    try {
      if (zipFile) {
        toast.info('Uploading source archive...');
        const { publicUrl } = await blink.storage.upload(
          zipFile,
          `archives/${Date.now()}-${zipFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        );
        uploadedZipUrl = publicUrl;
      }

      let analysisPrompt = `Analyze this project. `;
      if (githubUrl) analysisPrompt += `GitHub URL: ${githubUrl}. `;
      if (demoUrl) analysisPrompt += `Live Demo URL: ${demoUrl}. `;
      if (uploadedZipUrl) analysisPrompt += `A ZIP file archive is available at: ${uploadedZipUrl}. `;

      toast.info('Analyzing source and generating assets...');

      const result = await blink.ai.generateObject({
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            suggestedImagePrompt: { type: 'string' },
            mediaType: { type: 'string', enum: ['image', 'video', '3d'] },
            videoUrl: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            technicalDetails: { type: 'string' }
          },
          required: ['title', 'description', 'category', 'suggestedImagePrompt', 'mediaType', 'tags']
        },
        prompt: `${analysisPrompt} 
        Provide a complete, comprehensive, professional-grade portfolio entry.
        Include a professional title, a compelling 3-5 sentence description, 
        and a specific category. 
        Also suggest a DALL-E style prompt for a high-quality abstract background image representing this project.
        Provide 5-8 relevant descriptive tags.`
      });

      const { title, description, category, suggestedImagePrompt, mediaType, videoUrl, tags } = result.object as any;

      toast.info('Generating cover image...');
      const images = await blink.ai.generateImage({
        prompt: suggestedImagePrompt + " -- High quality, architectural, clean, professional aesthetic.",
        n: 1
      });

      const newFormData = {
        ...projectForm,
        title,
        description,
        category,
        imageUrl: images[0],
        mediaType: mediaType || 'image',
        videoUrl: videoUrl || '',
        tags: Array.isArray(tags) ? tags.join(', ') : '',
        zipUrl: uploadedZipUrl,
        auditData: null as any,
      };

      // Run audit
      try {
        toast.info('Running professional audit...');
        const auditResult = await blink.ai.generateObject({
          schema: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              findings: { type: 'string' },
              recommendations: { type: 'string' },
              auditType: { type: 'string' }
            },
            required: ['score', 'findings', 'recommendations', 'auditType']
          },
          prompt: `Audit this portfolio entry based on current best practices for professional galleries.
          Title: ${title}
          Description: ${description}
          Category: ${category}
          Tags: ${Array.isArray(tags) ? tags.join(', ') : tags}
          
          Provide a quality score (0-100), key findings, and specific recommendations for improvement.`
        });
        newFormData.auditData = auditResult.object as any;
      } catch {
        // Audit is optional
      }

      // AUTO-SAVE to database
      toast.info('Saving project to your library...');
      const savedProject = await saveProjectToDb(newFormData);
      
      if (savedProject) {
        setLastSavedProject(savedProject);
        toast.success(`"${title}" has been created and saved to your library!`);
        resetForm();
        onProjectAdded();
      } else {
        // If auto-save failed (e.g., missing fields), keep form populated for manual save
        setProjectForm(newFormData);
        toast.warning('Generated assets but could not auto-save. Click "Archive to Library" to save manually.');
      }
    } catch (error) {
      toast.error('Failed to generate assets');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Wrapper for the button click (no URL overrides)
  const handleIntakeGeneration = () => handleIntakeGenerationWithUrls();

  const handleExternalSync = async () => {
    if (selectedConnector.id === 'github') {
      if (!syncUrl && !zipFile && !deployedUrl) {
        return toast.error('Please provide a repository URL, ZIP file, or Deployed URL');
      }
      
      // Update form and use the values directly in handleIntakeGeneration
      const updatedGithubUrl = syncUrl || projectForm.githubUrl;
      const updatedDemoUrl = deployedUrl || projectForm.demoUrl;
      setProjectForm(prev => ({
        ...prev,
        githubUrl: updatedGithubUrl,
        demoUrl: updatedDemoUrl,
      }));
      
      // Call generation directly, passing the URLs we need
      // handleIntakeGeneration reads from projectForm state, so we set it first
      // and use a ref-like approach via the state setter
      await handleIntakeGenerationWithUrls(updatedGithubUrl, updatedDemoUrl);
      return;
    }

    if (!syncUrl) return toast.error(`Please provide a valid ${selectedConnector.name} identifier`);

    setIsSyncing(true);
    setLastSavedProject(null);

    try {
      let newFormData = { ...projectForm };

      if (selectedConnector.id === 'figma') {
        const me = await blink.auth.me();
        const metadata = JSON.parse(me?.metadata || '{}');
        const token = metadata.figmaToken;

        if (!token) {
          toast.error('Please configure your Figma Token in Settings first');
          return;
        }

        toast.info('Fetching Figma frames...');
        
        // Generate a proper image for Figma imports
        const images = await blink.ai.generateImage({
          prompt: "Elegant UI/UX design system preview with clean interface components, soft purple and white tones, professional aesthetic",
          n: 1
        });

        newFormData = {
          ...newFormData,
          title: 'Figma Design Artifact',
          description: 'Automated design snapshot imported directly from Figma ecosystem.',
          category: 'UI/UX Design',
          imageUrl: images[0],
          tags: 'Figma, Design, UI, UX',
          demoUrl: syncUrl,
        };
      } else {
        // Generic sync logic for others - Behance/Dribbble/etc.
        try {
          const { data, error } = await blink.functions.invoke('behance-sync', {
            body: { url: syncUrl, provider: selectedConnector.id }
          });
          
          if (error) throw new Error(error);
          
          if (data.projects && data.projects.length > 0) {
            const project = data.projects[0];
            newFormData = {
              ...newFormData,
              title: project.title,
              description: project.description,
              category: project.category || selectedConnector.category,
              imageUrl: project.imageUrl,
              demoUrl: project.demoUrl || syncUrl,
              tags: project.tags || selectedConnector.name
            };
          } else {
            throw new Error('No data returned');
          }
        } catch {
          // Fallback: generate assets for this connector
          toast.info(`Generating assets for ${selectedConnector.name} artifact...`);
          
          const result = await blink.ai.generateObject({
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                suggestedImagePrompt: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'description', 'category', 'suggestedImagePrompt', 'tags']
            },
            prompt: `Generate a professional portfolio entry for a creative artifact from ${selectedConnector.name}.
            The URL/identifier provided: ${syncUrl}
            Category context: ${selectedConnector.category}
            
            Create a compelling title, description, category, image prompt, and 5 tags.`
          });

          const { title, description, category, suggestedImagePrompt, tags: generatedTags } = result.object as any;

          const images = await blink.ai.generateImage({
            prompt: suggestedImagePrompt + " -- High quality, architectural, clean, professional aesthetic.",
            n: 1
          });

          newFormData = {
            ...newFormData,
            title,
            description,
            category,
            imageUrl: images[0],
            demoUrl: syncUrl,
            tags: Array.isArray(generatedTags) ? generatedTags.join(', ') : selectedConnector.name,
          };
        }
      }

      // AUTO-SAVE to database
      toast.info('Saving project to your library...');
      const savedProject = await saveProjectToDb(newFormData);
      
      if (savedProject) {
        setLastSavedProject(savedProject);
        toast.success(`"${newFormData.title}" has been created and saved to your library!`);
        resetForm();
        onProjectAdded();
      } else {
        setProjectForm(newFormData);
        toast.warning('Imported but could not auto-save. Click "Archive to Library" to save manually.');
      }
    } catch (error) {
      toast.error(`Failed to sync from ${selectedConnector.name}`);
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual save fallback (for when auto-save fails and form is populated)
  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const savedProject = await saveProjectToDb(projectForm);
      if (savedProject) {
        setLastSavedProject(savedProject);
        toast.success('Project saved to library!');
        resetForm();
        onProjectAdded();
      }
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  // Direct file upload (image, video, zip, etc.)
  const handleDirectFileUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setLastSavedProject(null);
    
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
      const isVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext);
      const isZip = ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
      const isPdf = ext === 'pdf';
      
      toast.info(`Uploading ${file.name}...`);
      const { publicUrl } = await blink.storage.upload(
        file,
        `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      );

      let newFormData = { ...projectForm };
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      
      if (isImage) {
        // For images: use as cover, generate title/description via AI
        toast.info('Analyzing image and creating project entry...');
        const result = await blink.ai.generateObject({
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'description', 'category', 'tags']
          },
          prompt: `Create a professional portfolio entry for an uploaded image file named "${file.name}".
          The image URL is: ${publicUrl}
          Generate a creative professional title, compelling 2-3 sentence description, 
          a fitting category, and 5 relevant tags.`
        });

        const { title, description, category, tags } = result.object as any;
        newFormData = {
          ...newFormData,
          title,
          description,
          category,
          imageUrl: publicUrl,
          mediaType: 'image',
          tags: Array.isArray(tags) ? tags.join(', ') : '',
        };

      } else if (isVideo) {
        toast.info('Processing video upload...');
        const coverImages = await blink.ai.generateImage({
          prompt: `Professional cover art for a video project titled "${baseName}", cinematic, clean design`,
          n: 1
        });

        newFormData = {
          ...newFormData,
          title: baseName.charAt(0).toUpperCase() + baseName.slice(1),
          description: `Video project uploaded from ${file.name}. Professional media artifact for portfolio showcase.`,
          category: 'Video',
          imageUrl: coverImages[0],
          mediaType: 'video',
          videoUrl: publicUrl,
          tags: 'Video, Media, Production',
        };

      } else if (isZip) {
        toast.info('Analyzing archive and generating project entry...');
        const result = await blink.ai.generateObject({
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              suggestedImagePrompt: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'description', 'category', 'suggestedImagePrompt', 'tags']
          },
          prompt: `Create a professional portfolio entry for an uploaded archive file named "${file.name}".
          It likely contains source code or project files.
          Generate a professional title, 3-sentence description, category, 
          an image generation prompt for a cover visual, and 5 tags.`
        });

        const { title, description, category, suggestedImagePrompt, tags } = result.object as any;
        const coverImages = await blink.ai.generateImage({
          prompt: suggestedImagePrompt + " -- High quality, professional aesthetic.",
          n: 1
        });

        newFormData = {
          ...newFormData,
          title,
          description,
          category,
          imageUrl: coverImages[0],
          zipUrl: publicUrl,
          tags: Array.isArray(tags) ? tags.join(', ') : '',
        };

      } else {
        // Generic file (PDF, doc, etc.)
        toast.info('Processing file and creating project entry...');
        const coverImages = await blink.ai.generateImage({
          prompt: `Professional document cover art for "${baseName}", minimalist, clean design, architectural`,
          n: 1
        });

        newFormData = {
          ...newFormData,
          title: baseName.charAt(0).toUpperCase() + baseName.slice(1),
          description: `Document artifact uploaded from ${file.name}. ${isPdf ? 'PDF document' : 'File'} added to portfolio library.`,
          category: isPdf ? 'Document' : 'File',
          imageUrl: coverImages[0],
          tags: isPdf ? 'Document, PDF, Reference' : 'File, Asset',
        };
      }

      // AUTO-SAVE to database
      toast.info('Saving to your library...');
      const savedProject = await saveProjectToDb(newFormData);
      
      if (savedProject) {
        setLastSavedProject(savedProject);
        toast.success(`"${newFormData.title}" has been created and saved!`);
        resetForm();
        onProjectAdded();
      } else {
        setProjectForm(newFormData);
      }
    } catch (error) {
      toast.error('Failed to process file');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConnectors = CREATIVE_CONNECTORS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isWorking = isGenerating || isSyncing || isAuditing || loading;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">
      {/* Success Banner */}
      {lastSavedProject && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-900">Project Saved Successfully</p>
              <p className="text-sm text-emerald-600">"{lastSavedProject.title}" is now in your library and ready to manage.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onTabChange?.('projects')}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              View in Library
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLastSavedProject(null)}
              className="text-emerald-600"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-3xl font-serif font-bold mb-4 flex items-center gap-2">
          Archive New Work
        </h3>
        <p className="text-muted-foreground text-lg">
          Upload files, provide URLs, or connect creative platforms. Each upload automatically creates a project entry in your library.
        </p>
      </div>

      {/* Quick Upload Zone */}
      <div className="bg-gradient-to-br from-zinc-50 to-zinc-100/50 border-2 border-dashed border-zinc-300 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
        <Upload className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
        <h4 className="font-bold text-lg mb-2">Quick Upload</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Drop any file here — images, videos, ZIPs, PDFs. A project page will be created automatically.
        </p>
        <Input 
          type="file" 
          accept="image/*,video/*,.zip,.rar,.7z,.pdf,.doc,.docx"
          className="hidden" 
          id="quick-upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleDirectFileUpload(file);
            e.target.value = '';
          }}
        />
        <Button asChild variant="default" className="rounded-full px-8" disabled={isWorking}>
          <label htmlFor="quick-upload" className="cursor-pointer">
            {isWorking ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
            {isWorking ? 'Processing...' : 'Choose File'}
          </label>
        </Button>
      </div>

      <div className="relative flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Or use connectors</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-zinc-50 border rounded-2xl p-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <RefreshCw className="h-3 w-3" /> Creative Artifact Connectors
            </label>
            
            <div className="space-y-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto p-1">
                {filteredConnectors.map((connector) => {
                  const Icon = connector.icon;
                  return (
                    <button
                      key={connector.id}
                      onClick={() => setSelectedConnector(connector)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                        selectedConnector.id === connector.id 
                          ? 'bg-zinc-950 text-white shadow-lg' 
                          : 'bg-white border text-zinc-400 hover:border-zinc-400 hover:text-zinc-600'
                      }`}
                      title={connector.name}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="Search 14+ connectors..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white border-zinc-200"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <selectedConnector.icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input 
                    placeholder={selectedConnector.placeholder} 
                    value={syncUrl}
                    onChange={e => setSyncUrl(e.target.value)}
                    className="pl-10 h-10 bg-white"
                  />
                </div>
                <Button 
                  onClick={handleExternalSync} 
                  disabled={isWorking}
                  className="h-10 px-4 shrink-0"
                  variant="secondary"
                >
                  {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>

              {selectedConnector.id === 'github' && (
                <div className="space-y-4 pt-2 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Deployed Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input 
                        placeholder="https://your-project.com" 
                        value={deployedUrl}
                        onChange={e => setDeployedUrl(e.target.value)}
                        className="pl-10 h-10 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Source Archive (ZIP)</label>
                    <div className="flex gap-2">
                      <Input 
                        type="file" 
                        accept=".zip" 
                        onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                        className="h-10 bg-white text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-zinc-100 file:text-zinc-600 hover:file:bg-zinc-200"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-white border border-zinc-100 rounded-lg">
                <p className="text-[11px] font-bold text-zinc-600">{selectedConnector.name}</p>
                <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">{selectedConnector.description}</p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 italic">Projects are automatically saved to your library after import.</p>
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
            disabled={isWorking}
            className="w-full h-14 rounded-xl text-lg font-bold gap-2 shadow-xl shadow-primary/10"
          >
            {isWorking ? <Loader2 className="animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {isGenerating ? 'Analyzing & Saving...' : 'Generate & Save to Library'}
          </Button>
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
              {isWorking 
                ? "Processing your upload — analyzing, generating assets, and saving to your library..." 
                : lastSavedProject
                  ? `Successfully saved "${lastSavedProject.title}". You can view and edit it in the Library tab.`
                  : projectForm.title 
                    ? `Ready to archive "${projectForm.title}". Click "Archive to Library" to save.`
                    : "Upload a file or provide a URL above. Each upload automatically creates a project entry in your library."}
            </p>
          </div>

          {/* Manual save fallback - only shown if form is populated but not yet saved */}
          {projectForm.title && projectForm.imageUrl && !lastSavedProject && (
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">Manual Override</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</label>
                  <Input 
                    placeholder="e.g. Fintech" 
                    value={projectForm.category}
                    onChange={e => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>
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
                className="bg-zinc-50 border-zinc-200 min-h-[80px]"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tags</label>
                <Input 
                  placeholder="e.g. React, Minimalist, Data" 
                  value={projectForm.tags}
                  onChange={e => setProjectForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-zinc-50 border-zinc-200"
                />
              </div>
              <Button 
                onClick={createProject} 
                disabled={loading || !projectForm.title || !projectForm.imageUrl}
                className="w-full h-12 rounded-xl font-bold gap-2 bg-zinc-950 hover:bg-zinc-900"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Archive to Library
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

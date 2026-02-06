import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';

interface ProjectSuggestion {
  title: string;
  description: string;
  category: string;
  tags: string[];
  imagePrompt: string;
}

interface ProjectRecommendationsProps {
  existingProjects: Array<{ title: string; category: string; tags?: string }>;
  onSelectSuggestion: (suggestion: ProjectSuggestion) => void;
}

export function ProjectRecommendations({ existingProjects, onSelectSuggestion }: ProjectRecommendationsProps) {
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setSelectedIndex(null);
    
    try {
      // Build context from existing projects
      const existingContext = existingProjects.length > 0
        ? existingProjects.slice(0, 5).map(p => `- ${p.title} (${p.category})`).join('\n')
        : 'No existing projects yet';

      const existingCategories = [...new Set(existingProjects.map(p => p.category))].join(', ') || 'None';
      const existingTags = [...new Set(existingProjects.flatMap(p => (p.tags || '').split(',').map(t => t.trim())))].filter(Boolean).slice(0, 10).join(', ') || 'None';

      const result = await blink.ai.generateObject({
        schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  imagePrompt: { type: 'string' }
                },
                required: ['title', 'description', 'category', 'tags', 'imagePrompt']
              },
              minItems: 3,
              maxItems: 3
            }
          },
          required: ['suggestions']
        },
        prompt: `You are a creative portfolio advisor. Generate 3 unique, compelling project suggestions for a professional portfolio.

EXISTING PORTFOLIO CONTEXT:
${existingContext}
Categories used: ${existingCategories}
Tags used: ${existingTags}

REQUIREMENTS:
1. Suggest projects that COMPLEMENT the existing portfolio (don't duplicate categories if possible)
2. Each project should be realistic and showcase different skills
3. Include modern, trending project types that impress clients
4. Make descriptions compelling and professional (2-3 sentences)
5. Provide 4-6 specific tags for each project
6. Create an AI image generation prompt for a stunning cover image

SUGGESTED PROJECT TYPES TO CONSIDER:
- Web/Mobile Apps (fintech, health, e-commerce, social)
- Brand Identity & Logo Design
- UI/UX Case Studies
- Marketing Campaigns
- Motion Graphics & Animation
- Product Design
- Photography Series
- Architecture/Interior Design
- Data Visualization Dashboards
- AR/VR Experiences

Generate 3 diverse, high-quality project suggestions.`
      });

      const { suggestions: newSuggestions } = result.object as { suggestions: ProjectSuggestion[] };
      setSuggestions(newSuggestions);
      toast.success('Generated 3 project recommendations!');
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (suggestion: ProjectSuggestion, index: number) => {
    setSelectedIndex(index);
    onSelectSuggestion(suggestion);
    toast.success(`Selected "${suggestion.title}" - form populated!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Project Recommendations
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Get AI-suggested project ideas based on your portfolio
          </p>
        </div>
        <Button
          onClick={generateSuggestions}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2 rounded-full"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : suggestions.length > 0 ? (
            <RefreshCw className="h-3.5 w-3.5" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {isLoading ? 'Generating...' : suggestions.length > 0 ? 'Regenerate' : 'Get Suggestions'}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion, index)}
              className={`group relative text-left p-4 rounded-xl border transition-all duration-200 ${
                selectedIndex === index
                  ? 'bg-primary/5 border-primary shadow-md shadow-primary/10'
                  : 'bg-zinc-50/50 border-zinc-200 hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600">
                      {index + 1}
                    </span>
                    <h5 className="font-bold text-zinc-900 truncate">{suggestion.title}</h5>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {suggestion.category}
                    </span>
                    {suggestion.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-[10px]">
                        {tag}
                      </span>
                    ))}
                    {suggestion.tags.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-400 text-[10px]">
                        +{suggestion.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`shrink-0 transition-all ${
                  selectedIndex === index 
                    ? 'text-primary' 
                    : 'text-zinc-300 group-hover:text-primary'
                }`}>
                  {selectedIndex === index ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!suggestions.length && !isLoading && (
        <div className="text-center py-6 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
          <Sparkles className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">
            Click "Get Suggestions" to generate AI-powered project ideas
          </p>
        </div>
      )}
    </div>
  );
}

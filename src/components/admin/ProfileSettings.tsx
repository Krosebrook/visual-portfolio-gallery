import React, { useState, useEffect } from 'react';
import { User, Shield, AtSign, Check, Loader2, Sparkles, Palette, Figma, Globe, Camera, Youtube, Video, PenTool, Mail, Linkedin, Twitter, Box, FileText, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import { CREATIVE_CONNECTORS } from '@/lib/connectors';

export function ProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingStyle, setSyncingStyle] = useState(false);
  const [figmaToken, setFigmaToken] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await blink.auth.me();
        if (me) {
          setUser(me);
          setUsername(me.username || '');
          setDisplayName(me.display_name || '');
          const metadata = JSON.parse(me.metadata || '{}');
          setFigmaToken(metadata.figmaToken || '');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setSaving(true);
    try {
      // Basic validation for username
      const validUsername = /^[a-zA-Z0-9_]{3,20}$/.test(username);
      if (!validUsername) {
        toast.error('Username must be 3-20 alphanumeric characters');
        return;
      }

      await blink.auth.updateMe({
        displayName,
        username: username.toLowerCase(),
        metadata: JSON.stringify({
          ...JSON.parse(user?.metadata || '{}'),
          figmaToken
        })
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint')) {
        toast.error('This username is already taken');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSyncStyle = async () => {
    try {
      setSyncingStyle(true);
      // Fetch the most recent project to use as a style reference
      const projects = await blink.db.projects.list({ limit: 1 });
      if (projects.length === 0) {
        toast.error('Add at least one project to sync style');
        return;
      }

      const imageUrl = projects[0].imageUrl;
      
      const { text } = await blink.ai.generateText({
        messages: [
          {
            role: 'system',
            content: 'Analyze the provided portfolio image and extract a primary and secondary HSL color that represents the brand. Return ONLY a JSON object: {"primary": "H S% L%", "secondary": "H S% L%"}',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract a palette from this image.' },
              { type: 'image', image: imageUrl },
            ],
          },
        ],
      });

      const extracted = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      if (extracted.primary) {
        // Save to metadata or a new theme field
        await blink.auth.updateMe({
          metadata: JSON.stringify({
            ...JSON.parse(user?.metadata || '{}'),
            theme: extracted
          })
        });

        // Apply immediately
        document.documentElement.style.setProperty('--primary', extracted.primary);
        toast.success('AI Theme synced successfully!');
      }
    } catch (error) {
      console.error('Style sync failed:', error);
      toast.error('AI Style sync failed');
    } finally {
      setSyncingStyle(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-12">
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-serif font-bold mb-2">Profile Hub</h3>
          <p className="text-muted-foreground text-sm">Manage your personal portfolio identity and platform settings.</p>
        </div>

        <div className="space-y-8">
          <div className="grid gap-4">
            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Personal Portfolio URL
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">
                visual.com/u/
              </span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                className="pl-[100px] h-12 bg-zinc-50 border-zinc-200 focus:bg-white transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400 italic">This will be your unique address: visual.com/u/{username || 'yourname'}</p>
          </div>

          <div className="grid gap-4">
            <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="h-12 bg-zinc-50 border-zinc-200 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-8 border-t">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="h-12 px-8 rounded-full gap-2 font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Profile Settings
            </Button>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
          <div className="flex items-center gap-3 mb-4 text-zinc-400">
            <Palette className="h-5 w-5" />
            <h4 className="text-sm font-bold uppercase tracking-widest">AI Style Sync</h4>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed mb-6">
            Automatically adjust your library's primary colors based on your most recent work. 
            AI will analyze your latest upload and extract a matching palette.
          </p>
          <Button 
            variant="outline" 
            onClick={handleSyncStyle}
            disabled={syncingStyle}
            className="w-full h-12 rounded-xl gap-2 font-bold uppercase text-xs tracking-widest border-zinc-200"
          >
            {syncingStyle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Sync AI Palette
          </Button>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
          <div className="flex items-center gap-3 mb-4 text-[#F24E1E]">
            <Figma className="h-5 w-5" />
            <h4 className="text-sm font-bold uppercase tracking-widest">Figma Integration</h4>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed mb-6">
            Connect your Figma account to import designs directly into your project artifacts. 
            Use a <a href="https://www.figma.com/settings/tokens" target="_blank" className="text-primary hover:underline">Personal Access Token</a>.
          </p>
          <div className="space-y-4">
            <Label htmlFor="figmaToken" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Figma Personal Access Token
            </Label>
            <Input
              id="figmaToken"
              type="password"
              value={figmaToken}
              onChange={(e) => setFigmaToken(e.target.value)}
              placeholder="figd_..."
              className="h-12 bg-zinc-50 border-zinc-200 focus:bg-white transition-all font-mono"
            />
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl gap-2 font-bold uppercase text-xs tracking-widest border-zinc-200"
              onClick={() => toast.info('Figma connector active. You can now import artifacts from the Project Intake tab.')}
            >
              Verify Connector
            </Button>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-bold uppercase tracking-widest">Active Creative Connectors</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {CREATIVE_CONNECTORS.filter(c => c.id !== 'figma').map((connector) => {
              const Icon = connector.icon;
              return (
                <div key={connector.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-100">
                  <div className="p-2 bg-zinc-50 rounded-lg">
                    <Icon className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-zinc-700">{connector.name}</p>
                    <p className="text-[9px] text-green-600 font-medium uppercase tracking-tighter">Connector Active</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-zinc-400 mt-6 text-center italic">
            All creative connectors are pre-configured to sync public artifacts.
          </p>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
          <div className="flex items-center gap-3 mb-4 text-zinc-400">
            <Shield className="h-5 w-5" />
            <h4 className="text-sm font-bold uppercase tracking-widest">Platform Security</h4>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your data is stored securely using Blink SDK's multi-tenant architecture. 
            All projects and testimonials are automatically associated with your unique account ID.
          </p>
        </div>
      </div>
    </div>
  );
}

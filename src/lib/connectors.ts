import { 
  Instagram, 
  Pin, 
  Palette, 
  Globe, 
  Briefcase, 
  Camera, 
  Youtube, 
  Video, 
  PenTool, 
  Mail, 
  Linkedin, 
  Twitter, 
  Box, 
  FileText,
  Figma,
  LayoutGrid,
  Laptop
} from 'lucide-react';

export interface CreativeArtifact {
  id: string;
  name: string;
  icon: any;
  placeholder: string;
  description: string;
  category: string;
}

export const CREATIVE_CONNECTORS: CreativeArtifact[] = [
  {
    id: 'behance',
    name: 'Behance',
    icon: LayoutGrid,
    placeholder: 'behance.net/username',
    description: 'Import projects, moodboards, and case studies.',
    category: 'Design'
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    icon: LayoutGrid,
    placeholder: 'dribbble.com/username',
    description: 'Sync shots and creative snippets.',
    category: 'Design'
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: Figma,
    placeholder: 'File Key',
    description: 'Extract design frames and prototypes.',
    category: 'Product'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    placeholder: 'instagram.com/p/ID',
    description: 'Import visual storytelling and media posts.',
    category: 'Social'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: Pin,
    placeholder: 'pinterest.com/pin/ID',
    description: 'Sync inspiration boards and visual references.',
    category: 'Curation'
  },
  {
    id: 'artstation',
    name: 'ArtStation',
    icon: Palette,
    placeholder: 'artstation.com/artwork/ID',
    description: 'Extract high-fidelity digital art and 3D renders.',
    category: 'Art'
  },
  {
    id: 'adobe_portfolio',
    name: 'Adobe Portfolio',
    icon: Globe,
    placeholder: 'myportfolio.com/project',
    description: 'Sync your professional Adobe-hosted work.',
    category: 'Portfolio'
  },
  {
    id: 'carbonmade',
    name: 'Carbonmade',
    icon: Briefcase,
    placeholder: 'carbonmade.com/portfolios/ID',
    description: 'Import projects from Carbonmade profiles.',
    category: 'Portfolio'
  },
  {
    id: 'vsco',
    name: 'VSCO',
    icon: Camera,
    placeholder: 'vsco.co/username/media/ID',
    description: 'Extract aesthetic photography artifacts.',
    category: 'Photography'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    placeholder: 'youtube.com/watch?v=ID',
    description: 'Sync video presentations and motion work.',
    category: 'Video'
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    icon: Video,
    placeholder: 'vimeo.com/ID',
    description: 'Import cinematic and professional video work.',
    category: 'Video'
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: PenTool,
    placeholder: 'medium.com/@username/story',
    description: 'Extract design thinking and case studies.',
    category: 'Writing'
  },
  {
    id: 'substack',
    name: 'Substack',
    icon: Mail,
    placeholder: 'substack.com/p/ID',
    description: 'Sync newsletter artifacts and deep dives.',
    category: 'Writing'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'linkedin.com/posts/ID',
    description: 'Import professional milestones and articles.',
    category: 'Social'
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: Twitter,
    placeholder: 'x.com/status/ID',
    description: 'Sync thread artifacts and media snippets.',
    category: 'Social'
  },
  {
    id: 'sketchfab',
    name: 'Sketchfab',
    icon: Box,
    placeholder: 'sketchfab.com/3d-models/ID',
    description: 'Import interactive 3D model artifacts.',
    category: '3D'
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: FileText,
    placeholder: 'notion.so/page-ID',
    description: 'Extract structured project documentation.',
    category: 'Productivity'
  }
];

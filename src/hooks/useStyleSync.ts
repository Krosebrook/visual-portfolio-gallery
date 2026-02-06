import { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';

export function useStyleSync(imageUrl?: string) {
  const [palette, setPalette] = useState<{ primary: string; secondary: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    const syncStyle = async () => {
      try {
        setLoading(true);
        
        // Use AI Vision to extract a palette
        const { text } = await blink.ai.generateText({
          messages: [
            {
              role: 'system',
              content: 'You are a professional UI designer. Analyze the provided image and extract a primary and secondary HSL color that represents the mood and aesthetic. Return ONLY a JSON object: {"primary": "H S% L%", "secondary": "H S% L%"}',
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
        setPalette(extracted);

        // Apply to CSS variables
        if (extracted.primary) {
          document.documentElement.style.setProperty('--primary', extracted.primary);
        }
        if (extracted.secondary) {
          document.documentElement.style.setProperty('--accent-2', extracted.secondary);
        }
      } catch (error) {
        console.error('AI Style Sync failed:', error);
      } finally {
        setLoading(false);
      }
    };

    syncStyle();
  }, [imageUrl]);

  return { palette, loading };
}

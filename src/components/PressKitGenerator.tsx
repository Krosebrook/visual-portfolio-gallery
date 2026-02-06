import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';

export function PressKitGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const projects = await blink.db.projects.list();
      const testimonials = await blink.db.testimonials.list();

      // Create a hidden element to render the press kit for capture
      const element = document.createElement('div');
      element.style.width = '800px';
      element.style.padding = '60px';
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#111827';
      element.style.fontFamily = 'serif';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      
      element.innerHTML = `
        <div style="border-bottom: 2px solid #991b1b; padding-bottom: 20px; margin-bottom: 40px;">
          <h1 style="font-size: 48px; margin: 0; letter-spacing: -0.05em;">Visual <span style="color: #991b1b; font-style: italic;">Library</span> Press Kit</h1>
          <p style="font-family: sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em; color: #6b7280; margin-top: 10px;">Archive Collection 01 &copy; ${new Date().getFullYear()}</p>
        </div>

        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 24px; border-left: 4px solid #991b1b; padding-left: 15px; margin-bottom: 20px;">Curated Projects</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${projects.slice(0, 4).map(p => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #f9fafb; padding: 15px;">
                <h3 style="font-size: 18px; margin: 0 0 8px 0;">${p.title}</h3>
                <p style="font-family: sans-serif; font-size: 12px; color: #991b1b; text-transform: uppercase; margin-bottom: 10px;">${p.category}</p>
                <p style="font-family: sans-serif; font-size: 14px; color: #4b5563; line-height: 1.5;">${p.description.substring(0, 100)}...</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 24px; border-left: 4px solid #991b1b; padding-left: 15px; margin-bottom: 20px;">Client Testimonials</h2>
          <div style="space-y: 15px;">
            ${testimonials.slice(0, 2).map(t => `
              <div style="padding: 20px; background: #f3f4f6; border-radius: 12px; margin-bottom: 15px;">
                <p style="font-style: italic; font-size: 16px; margin-bottom: 15px;">"${t.content}"</p>
                <p style="font-family: sans-serif; font-size: 14px; font-weight: bold; margin: 0;">${t.client_name}</p>
                <p style="font-family: sans-serif; font-size: 12px; color: #6b7280; margin: 0;">${t.client_role}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-family: sans-serif; font-size: 12px; color: #9b9b9b; text-align: center;">
          <p>Generated automatically via Visual Library Portal</p>
          <p>Contact: library@visual.com | visual-library.com</p>
        </div>
      `;

      document.body.appendChild(element);
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PressKit_${new Date().getTime()}.pdf`);
      
      document.body.removeChild(element);
      toast.success('Press Kit downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate Press Kit');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      disabled={isGenerating}
      variant="outline" 
      size="lg"
      className="rounded-full px-8 h-14 text-lg border-primary/20 hover:bg-primary/5 group"
    >
      {isGenerating ? (
        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
      ) : (
        <FileText className="mr-2 w-5 h-5 transition-transform group-hover:scale-110" />
      )}
      {isGenerating ? 'Generating Kit...' : 'Download Press Kit'}
    </Button>
  );
}

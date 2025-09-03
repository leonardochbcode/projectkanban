'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Opportunity, OpportunityAttachment } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

export function OpportunityAttachmentForm({ opportunity }: { opportunity: Opportunity }) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateOpportunity } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    // This is a mock upload. In a real app, you'd upload the file to a
    // service like Firebase Storage and get a URL back.
    const file = files[0];
    const newAttachment: OpportunityAttachment = {
      id: `attachment-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // Mock URL for local preview
      createdAt: new Date().toISOString(),
    };

    const updatedAttachments = [...(opportunity.attachments || []), newAttachment];
    updateOpportunity({ ...opportunity, attachments: updatedAttachments });

    toast({
        title: 'Anexo adicionado',
        description: `O arquivo "${file.name}" foi anexado à oportunidade.`,
    });
    
    setIsLoading(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      <Button onClick={handleButtonClick} disabled={isLoading} variant="outline" className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? 'Anexando...' : 'Adicionar Anexo'}
      </Button>
    </div>
  );
}

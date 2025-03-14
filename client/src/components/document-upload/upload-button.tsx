import { useRef, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { uploadDocument } from "@/api/documents";
import { cn } from "@/lib/utils";

interface UploadButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function UploadButton({ 
  className,
  variant = "outline",
  size = "default"
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: (data) => {
      toast({
        title: "Document uploaded",
        description: "Your document has been analyzed for financial insights.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/insights'] });
      setFileName(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setFileName(null);
    }
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Excel file",
        variant: "destructive",
      });
      return;
    }
    
    setFileName(file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    uploadMutation.mutate(formData);
    
    // Reset the input
    e.target.value = '';
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="sr-only"
        accept=".pdf,.xlsx,.xls"
      />
      
      {fileName && uploadMutation.isPending ? (
        <Button
          variant={variant}
          size={size}
          className="flex items-center space-x-2"
          disabled
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="max-w-[150px] truncate">Analyzing {fileName}...</span>
        </Button>
      ) : (
        <Button
          variant={variant}
          size={size}
          className="flex items-center space-x-2"
          onClick={handleClick}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span>Upload Financial Document</span>
        </Button>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">
        Upload statements, reports or investment data (PDF/Excel)
      </p>
    </div>
  );
}

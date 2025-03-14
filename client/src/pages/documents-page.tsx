import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDocuments, deleteDocument, Document as DocumentType } from "@/api/documents";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  FileSpreadsheet, 
  File, 
  Download, 
  Trash, 
  MoreHorizontal, 
  Eye,
  AlertCircle,
  Loader2
} from "lucide-react";
import UploadButton from "@/components/document-upload/upload-button";
import { format } from "date-fns";

export default function DocumentsPage() {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  
  // Get documents
  const { 
    data: documents, 
    isLoading, 
    error 
  } = useQuery<DocumentType[]>({
    queryKey: ['/api/documents'],
    queryFn: fetchDocuments,
  });
  
  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-blue-500" />;
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Failed</Badge>;
      default:
        return null;
    }
  };
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Upload and analyze your financial documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Error loading documents</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Failed to load documents"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/documents'] })} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Upload and analyze your financial documents
          </CardDescription>
        </div>
        <UploadButton />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : documents && documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center">
                    {getFileIcon(doc.type)}
                    <span className="ml-2">{doc.name}</span>
                  </TableCell>
                  <TableCell>
                    {doc.type.split('/').pop()?.toUpperCase()}
                  </TableCell>
                  <TableCell>{formatFileSize(doc.size)}</TableCell>
                  <TableCell>{format(new Date(doc.uploaded_at), 'dd MMM, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(doc.analysis_status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {doc.analysis_status === 'completed' && (
                          <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Analysis
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this document?')) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="text-red-500 focus:text-red-500"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No documents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your financial documents for AI-powered analysis
            </p>
            <UploadButton />
          </div>
        )}
      </CardContent>
      
      {/* Document Analysis Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedDocument && getFileIcon(selectedDocument.type)}
              <span className="ml-2">{selectedDocument?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Uploaded on {selectedDocument && format(new Date(selectedDocument.uploaded_at), 'dd MMMM, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument?.analysis && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.analysis.summary}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Key Insights</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {selectedDocument.analysis.insights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
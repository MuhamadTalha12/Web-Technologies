import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface ImageUploadProps {
  bucket: 'avatars' | 'service-images';
  userId: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  variant?: 'avatar' | 'cover';
  className?: string;
}

export function ImageUpload({
  bucket,
  userId,
  currentUrl,
  onUpload,
  variant = 'avatar',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const applyUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      toast({
        variant: 'destructive',
        title: 'Missing URL',
        description: 'Paste an image URL',
      });
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid http(s) URL',
      });
      return;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Only http(s) URLs are supported',
      });
      return;
    }

    setPreview(trimmed);
    onUpload(trimmed);
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    toast({
      title: 'Image set',
      description: 'Using the image URL you provided',
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image under 5MB',
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const form = new FormData();
      form.append('bucket', bucket);
      form.append('file', file);

      const data = await api<{ url: string }>(`/uploads?bucket=${encodeURIComponent(bucket)}`,
      {
        method: 'POST',
        body: form,
      });

      // Server returns a relative URL like /uploads/...
      onUpload(data.url);
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setPreview(currentUrl || null);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={preview || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              <Upload className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive"
            >
              <X className="mr-1 h-3 w-3" />
              Remove
            </Button>
          )}

          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL (https://...)"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyUrl(urlInput)}
              disabled={uploading}
            >
              Use URL
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Cover/service image variant
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative aspect-video rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="h-10 w-10 mb-2" />
            <p className="text-sm">Click to upload an image</p>
            <p className="text-xs">PNG, JPG up to 5MB</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : preview ? (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Change Image
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>

      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste image URL (https://...)"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => applyUrl(urlInput)}
          disabled={uploading}
        >
          Use URL
        </Button>
      </div>
    </div>
  );
}

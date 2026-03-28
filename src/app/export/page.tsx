'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Play, Check, X, Loader2, Copy, Twitter, Linkedin, Facebook, CheckCircle2 } from 'lucide-react';

type ExportStatus = 'idle' | 'preparing' | 'rendering' | 'encoding' | 'finalizing' | 'completed' | 'failed';
type Resolution = '480p' | '720p' | '1080p' | '4k';
type Format = 'mp4' | 'gif';
type Quality = 'low' | 'medium' | 'high';

const RESOLUTION_OPTIONS: Record<Resolution, { label: string; width: number; height: number }> = {
  '480p': { label: '480p (SD)', width: 854, height: 480 },
  '720p': { label: '720p (HD)', width: 1280, height: 720 },
  '1080p': { label: '1080p (Full HD)', width: 1920, height: 1080 },
  '4k': { label: '4K (Ultra HD)', width: 3840, height: 2160 },
};

const FORMAT_OPTIONS: Record<Format, { label: string; description: string }> = {
  'mp4': { label: 'MP4', description: 'Best for sharing and editing' },
  'gif': { label: 'GIF', description: 'Best for short loops and social media' },
};

const QUALITY_OPTIONS: Record<Quality, { label: string; bitrate: number }> = {
  'low': { label: 'Low', bitrate: 2 },
  'medium': { label: 'Medium', bitrate: 5 },
  'high': { label: 'High', bitrate: 10 },
};

const STATUS_STEPS: { status: ExportStatus; label: string }[] = [
  { status: 'preparing', label: 'Preparing' },
  { status: 'rendering', label: 'Rendering' },
  { status: 'encoding', label: 'Encoding' },
  { status: 'finalizing', label: 'Finalizing' },
];

function estimateFileSize(resolution: Resolution, format: Format, duration: number, quality: Quality): string {
  const res = RESOLUTION_OPTIONS[resolution];
  const pixels = res.width * res.height;
  const qualityBitrate = QUALITY_OPTIONS[quality].bitrate;

  if (format === 'gif') {
    const estimatedMB = (pixels / 100000) * duration * 0.5;
    return estimatedMB < 1 ? `${(estimatedMB * 1000).toFixed(0)} KB` : `${estimatedMB.toFixed(1)} MB`;
  }

  const estimatedMB = qualityBitrate * duration;
  if (estimatedMB < 1000) {
    return `${estimatedMB.toFixed(1)} MB`;
  }
  return `${(estimatedMB / 1000).toFixed(2)} GB`;
}

function estimateTimeRemaining(progress: number, elapsedSeconds: number): string {
  if (progress === 0) return 'Calculating...';
  const totalEstimated = (elapsedSeconds / progress) * 100;
  const remaining = totalEstimated - elapsedSeconds;

  if (remaining < 60) return `${Math.ceil(remaining)} seconds`;
  if (remaining < 3600) return `${Math.ceil(remaining / 60)} minutes`;
  return `${(remaining / 3600).toFixed(1)} hours`;
}

export default function ExportPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [format, setFormat] = useState<Format>('mp4');
  const [quality, setQuality] = useState<Quality>('high');
  const [duration] = useState(30);

  const [exportId, setExportId] = useState<string | null>(null);
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/export');
    }
  }, [user, isLoading, router]);

  const startExport = useCallback(async () => {
    if (!user) return;

    setIsExporting(true);
    setStatus('preparing');
    setProgress(0);
    setElapsedSeconds(0);

    try {
      const { data, error } = await supabase
        .from('exports')
        .insert({
          user_id: user.id,
          resolution,
          format,
          quality,
          status: 'preparing',
          progress: 0,
          estimated_size: estimateFileSize(resolution, format, duration, quality),
        })
        .select()
        .single();

      if (error) throw error;
      setExportId(data.id);
    } catch (err) {
      console.error('Failed to create export record:', err);
      setStatus('failed');
      setIsExporting(false);
    }
  }, [user, resolution, format, quality, duration]);

  useEffect(() => {
    if (!exportId || status === 'idle' || status === 'completed' || status === 'failed') return;

    const interval = setInterval(async () => {
      setElapsedSeconds((prev) => prev + 1);

      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        const stepIndex = STATUS_STEPS.findIndex((s) => s.status === status);
        const stepProgress = prev + (100 / STATUS_STEPS.length / 10);
        const newProgress = Math.min(stepProgress, (stepIndex + 1) * (100 / STATUS_STEPS.length));

        if (newProgress >= (stepIndex + 1) * (100 / STATUS_STEPS.length)) {
          const nextStep = STATUS_STEPS[stepIndex + 1];
          if (nextStep) {
            setStatus(nextStep.status);
          }
        }

        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [exportId, status]);

  useEffect(() => {
    if (!exportId || status !== 'finalizing') return;

    const completeExport = async () => {
      try {
        await supabase
          .from('exports')
          .update({
            status: 'completed',
            progress: 100,
            download_url: 'https://example.com/video-export.mp4',
            share_url: `https://example.com/share/${exportId}`,
          })
          .eq('id', exportId);

        setDownloadUrl('https://example.com/video-export.mp4');
        setShareLink(`https://example.com/share/${exportId}`);
        setPreviewUrl('https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800');
        setStatus('completed');
        setProgress(100);
        setIsExporting(false);
      } catch (err) {
        console.error('Failed to complete export:', err);
        setStatus('failed');
        setIsExporting(false);
      }
    };

    const timeout = setTimeout(completeExport, 2000);
    return () => clearTimeout(timeout);
  }, [exportId, status]);

  const cancelExport = async () => {
    if (exportId) {
      try {
        await supabase
          .from('exports')
          .update({ status: 'cancelled' })
          .eq('id', exportId);
      } catch (err) {
        console.error('Failed to cancel export:', err);
      }
    }
    setIsExporting(false);
    setStatus('idle');
    setProgress(0);
    setElapsedSeconds(0);
    setExportId(null);
  };

  const copyShareLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const text = 'Check out my video created with HYDRA-VIDEOGEN!';
    const url = shareLink || window.location.origin;

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Branding */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.chat2db-ai.com/app/avatar/custom/facab45b-1210-435a-8852-f26f7ff68160_unknown.jpeg" alt="HYDRA-VIDEOGEN" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">HYDRA-VIDEOGEN</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Export Video</h1>
          <p className="text-muted-foreground mt-1">Configure and export your video</p>
        </div>

        {status === 'idle' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Choose your export settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Resolution</label>
                  <RadioGroup value={resolution} onValueChange={(v) => setResolution(v as Resolution)}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(Object.keys(RESOLUTION_OPTIONS) as Resolution[]).map((res) => (
                        <label
                          key={res}
                          className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                            resolution === res
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={res} className="sr-only" />
                          <span className="text-sm font-medium">{RESOLUTION_OPTIONS[res].label}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Format</label>
                  <RadioGroup value={format} onValueChange={(v) => setFormat(v as Format)}>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(FORMAT_OPTIONS) as Format[]).map((fmt) => (
                        <label
                          key={fmt}
                          className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                            format === fmt
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={fmt} className="sr-only" />
                          <span className="text-sm font-medium">{FORMAT_OPTIONS[fmt].label}</span>
                          <span className="text-xs text-muted-foreground mt-1">{FORMAT_OPTIONS[fmt].description}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Quality</label>
                  <RadioGroup value={quality} onValueChange={(v) => setQuality(v as Quality)}>
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.keys(QUALITY_OPTIONS) as Quality[]).map((q) => (
                        <label
                          key={q}
                          className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                            quality === q
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={q} className="sr-only" />
                          <span className="text-sm font-medium capitalize">{QUALITY_OPTIONS[q].label}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimated File Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-1">
                      {estimateFileSize(resolution, format, duration, quality)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Resolution: {RESOLUTION_OPTIONS[resolution].label} | Format: {format.toUpperCase()} | Duration: {duration}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              onClick={startExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </Button>
          </div>
        )}

        {isExporting && status !== 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting Video
              </CardTitle>
              <CardDescription>
                Please wait while your video is being exported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {STATUS_STEPS.map((step, index) => {
                  const stepStart = index * (100 / STATUS_STEPS.length);
                  const stepEnd = (index + 1) * (100 / STATUS_STEPS.length);
                  const isActive = progress >= stepStart && progress < stepEnd;
                  const isComplete = progress >= stepEnd || status === 'completed';

                  return (
                    <Badge
                      key={step.status}
                      variant={isComplete ? 'default' : isActive ? 'secondary' : 'outline'}
                      className={`px-3 py-1 ${
                        isActive ? 'animate-pulse' : ''
                      }`}
                    >
                      {isComplete ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : isActive ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : null}
                      {step.label}
                    </Badge>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Current step: {STATUS_STEPS.find((s) => s.status === status)?.label || 'Preparing'}</span>
                <span>Time remaining: {estimateTimeRemaining(progress, elapsedSeconds)}</span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={cancelExport}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Export
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'completed' && (
          <div className="space-y-6">
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-6 h-6" />
                  Export Complete!
                </CardTitle>
                <CardDescription>
                  Your video has been exported successfully
                </CardDescription>
              </CardHeader>
            </Card>

            {previewUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black/5 relative">
                    <img
                      src={previewUrl}
                      alt="Video preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="icon" variant="secondary" className="rounded-full w-16 h-16">
                        <Play className="w-8 h-8 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Download</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">video-export.{format}</p>
                      <p className="text-sm text-muted-foreground">
                        {estimateFileSize(resolution, format, duration, quality)}
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <a href={downloadUrl || '#'} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Share</CardTitle>
                <CardDescription>Share your video on social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shareLink && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-muted/50 font-mono text-sm truncate">
                      {shareLink}
                    </div>
                    <Button variant="outline" size="icon" onClick={copyShareLink}>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => shareToSocial('twitter')}
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => shareToSocial('linkedin')}
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => shareToSocial('facebook')}
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={copyShareLink}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Share Link'}
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setExportId(null);
                  setDownloadUrl(null);
                  setShareLink(null);
                  setPreviewUrl(null);
                }}
              >
                Export Another Video
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <X className="w-5 h-5" />
                Export Failed
              </CardTitle>
              <CardDescription>
                Something went wrong during the export process. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setExportId(null);
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

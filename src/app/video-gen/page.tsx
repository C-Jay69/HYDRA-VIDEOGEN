'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface VideoGenerationResult {
  success: boolean;
  jobId?: string;
  videoUrl?: string;
  status?: string;
  error?: string;
}

type GenerationStatus = 'idle' | 'generating_image' | 'generating_video' | 'complete' | 'error';

export default function VideoGenPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoGenerationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Poll for job status
  const pollJobStatus = useCallback(async (jobId: string, maxAttempts = 60) => {
    let attempts = 0;

    const poll = async (): Promise<VideoGenerationResult> => {
      if (attempts >= maxAttempts) {
        throw new Error('Job timed out after maximum attempts');
      }

      attempts++;
      setProgress(Math.min(90, 50 + attempts));

      try {
        const response = await fetch(`/api/video-generate?jobId=${jobId}`);
        const data = await response.json();

        if (!data.success) {
          if (data.error === 'Job not found' || data.error === 'Job expired') {
            throw new Error(data.error);
          }
          throw new Error(data.error);
        }

        if (data.status === 'completed' && data.videoUrl) {
          return data;
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'Video generation failed');
        }

        // Still processing, wait and poll again
        await new Promise(resolve => setTimeout(resolve, 5000));
        return poll();

      } catch (err) {
        if (attempts < maxAttempts && !(err instanceof Error && (err.message.includes('not found') || err.message.includes('expired') || err.message.includes('timed out')))) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return poll();
        }
        throw err;
      }
    };

    return poll();
  }, []);

  // Generate video
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setStatus('generating_image');
    setProgress(10);

    try {
      console.log('Starting video generation with prompt:', prompt);

      const response = await fetch('/api/video-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data: VideoGenerationResult = await response.json();
      console.log('API Response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      if (data.status === 'completed' && data.videoUrl) {
        // Video was generated immediately (rare, but possible)
        setResult(data);
        setStatus('complete');
        setProgress(100);
      } else if (data.jobId) {
        // Poll for job completion
        setStatus('generating_video');
        setProgress(50);

        const finalResult = await pollJobStatus(data.jobId);
        setResult(finalResult);
        setStatus('complete');
        setProgress(100);
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStatus('error');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, pollJobStatus]);

  // Download video
  const handleDownload = useCallback(() => {
    if (!result?.videoUrl) return;

    const link = document.createElement('a');
    link.href = result.videoUrl;
    link.download = `generated-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  // Reset and start over
  const handleReset = useCallback(() => {
    setPrompt('');
    setIsGenerating(false);
    setStatus('idle');
    setError(null);
    setResult(null);
    setProgress(0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <img src="https://cdn.chat2db-ai.com/app/avatar/custom/facab45b-1210-435a-8852-f26f7ff68160_unknown.jpeg" alt="HYDRA-VIDEOGEN" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">HYDRA-VIDEOGEN</span>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 mb-4">
            <Video className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Video Generation</h1>
          <p className="text-muted-foreground text-lg">
            Generate stunning videos from text prompts using AI
          </p>
        </div>

        {/* Generation Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Create Your Video
            </CardTitle>
            <CardDescription>
              Describe your video in detail for best results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Video Description</Label>
              <Textarea
                id="prompt"
                placeholder="A serene sunset over the ocean waves, with seagulls flying in the distance, cinematic style, 4K quality..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be descriptive! Include subjects, actions, style, and mood for better results.
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {status === 'generating_image' ? 'Generating Image...' : 'Generating Video...'}
                </>
              ) : (
                <>
                  <Video className="h-5 w-5 mr-2" />
                  Generate Video
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {(isGenerating || status === 'complete') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {status === 'generating_image' && 'Creating base image...'}
                    {status === 'generating_video' && 'Animating frames...'}
                    {status === 'complete' && 'Complete!'}
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Generation Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Card */}
        {status === 'complete' && result?.videoUrl && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-400/10 to-blue-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Video Generated Successfully!</CardTitle>
                    <CardDescription>
                      Your AI-generated video is ready
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={result.videoUrl}
                  className="w-full h-full"
                  controls
                  playsInline
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownload} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Create Another
                </Button>
              </div>

              {/* Job Info */}
              {result.jobId && (
                <div className="text-xs text-muted-foreground">
                  Job ID: {result.jobId}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-cyan-400/20 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-cyan-400">1</span>
                </div>
                <h3 className="font-semibold mb-2">Describe Your Vision</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a detailed text description of the video you want to create
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-blue-400/20 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-blue-400">2</span>
                </div>
                <h3 className="font-semibold mb-2">AI Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI creates an image and animates it into a video sequence
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-purple-400/20 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-purple-400">3</span>
                </div>
                <h3 className="font-semibold mb-2">Download & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Preview and download your generated video in MP4 format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

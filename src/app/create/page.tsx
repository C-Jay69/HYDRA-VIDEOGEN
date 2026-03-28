'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Sparkles,
  FileText,
  Clapperboard,
  Image,
  Mic,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Wand2,
  Play,
  Monitor,
  Smartphone,
  Square,
  Clock,
  Video,
} from 'lucide-react';

const PRESET_PROMPTS = [
  { label: 'Product Demo', prompt: 'A sleek product showcase featuring our latest gadget rotating on a minimalist pedestal, with dramatic lighting and smooth camera movements highlighting key features.' },
  { label: 'Social Media Ad', prompt: 'A punchy, attention-grabbing video ad with fast transitions, bold text overlays, and vibrant colors showcasing our product in everyday scenarios.' },
  { label: 'Tutorial', prompt: 'A clear and engaging tutorial with step-by-step instructions, on-screen annotations, and a friendly presenter guiding viewers through the process.' },
  { label: 'Birthday Message', prompt: 'A warm and festive birthday greeting with confetti animations, heartfelt messages, and cheerful scenes celebrating the special day.' },
  { label: 'Brand Story', prompt: 'An emotional brand narrative with cinematic visuals, showcasing company origins, values, and customer success stories.' },
  { label: 'Event Promo', prompt: 'An energetic event promotion with countdown elements, venue highlights, speaker previews, and call-to-action overlays.' },
];

const ASPECT_RATIOS = [
  { value: '16:9', label: 'Landscape', icon: Monitor },
  { value: '9:16', label: 'Portrait', icon: Smartphone },
  { value: '1:1', label: 'Square', icon: Square },
];

const DURATIONS = [
  { value: '15', label: '15s', creditCost: 1 },
  { value: '30', label: '30s', creditCost: 2 },
  { value: '60', label: '60s', creditCost: 4 },
  { value: '180', label: '3min', creditCost: 8 },
];

const PROCESSING_STEPS = [
  { id: 'script', label: 'Script', icon: FileText, description: 'Writing script' },
  { id: 'scenes', label: 'Scenes', icon: Clapperboard, description: 'Designing scenes' },
  { id: 'media', label: 'Media', icon: Image, description: 'Generating visuals' },
  { id: 'voiceover', label: 'Voice', icon: Mic, description: 'Creating voiceover' },
];

type WizardStep = 'prompt' | 'processing' | 'complete';

export default function CreatePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState<WizardStep>('prompt');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('30');
  const [quality, setQuality] = useState([80]);
  const [processingStep, setProcessingStep] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/create');
    }
  }, [user, authLoading, router]);

  const handlePresetSelect = useCallback((presetPrompt: string) => {
    setPrompt(presetPrompt);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setStep('processing');
    setProcessingStep(0);

    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProcessingStep(i + 1);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newProjectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setProjectId(newProjectId);
    setStep('complete');
  }, [prompt]);

  const handleEditVideo = useCallback(() => {
    if (projectId) {
      router.push(`/editor?project=${projectId}`);
    }
  }, [projectId, router]);

  const handleStartOver = useCallback(() => {
    setStep('prompt');
    setPrompt('');
    setProcessingStep(0);
    setProjectId(null);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Video className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">VidAI Studio</span>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {['prompt', 'processing', 'complete'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                    step === s
                      ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/25'
                      : ['processing', 'complete'].indexOf(step) > idx
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {['processing', 'complete'].indexOf(step) > idx ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div
                    className={`h-0.5 w-16 sm:w-24 transition-all duration-300 ${
                      ['processing', 'complete'].indexOf(step) > idx
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-8 text-xs text-muted-foreground">
            <span>Describe</span>
            <span>Generate</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Step 1: Prompt */}
        {step === 'prompt' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Create Your Video
              </h1>
              <p className="text-muted-foreground text-lg">
                Describe your vision and let AI do the magic
              </p>
            </div>

            <Card className="border-border/50 shadow-xl">
              <CardContent className="p-6 space-y-6">
                {/* Prompt Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Describe Your Video
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A cinematic product video showcasing our new smartwatch with dramatic lighting and smooth camera movements..."
                    className="min-h-[150px] resize-none text-base bg-muted/50 border-2 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {prompt.length} / 2000 characters
                  </p>
                </div>

                {/* Preset Suggestions */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Quick Start Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PROMPTS.map((preset) => (
                      <Badge
                        key={preset.label}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 px-3 py-1.5 text-sm"
                        onClick={() => handlePresetSelect(preset.prompt)}
                      >
                        {preset.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ASPECT_RATIOS.map((ratio) => {
                      const Icon = ratio.icon;
                      return (
                        <button
                          key={ratio.value}
                          onClick={() => setAspectRatio(ratio.value)}
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            aspectRatio === ratio.value
                              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                              : 'border-border hover:border-primary/50 bg-muted/30'
                          }`}
                        >
                          <Icon className={`h-6 w-6 ${aspectRatio === ratio.value ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="text-center">
                            <div className={`text-sm font-semibold ${aspectRatio === ratio.value ? 'text-primary' : ''}`}>
                              {ratio.value}
                            </div>
                            <div className="text-xs text-muted-foreground">{ratio.label}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{d.label}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {d.creditCost} credit{d.creditCost > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Quality</label>
                    <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-accent/10">
                      {quality}% HD
                    </Badge>
                  </div>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={50}
                    step={10}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Standard</span>
                    <span>Cinematic</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#6c3bff] to-[#00d4ff] hover:opacity-90 shadow-lg shadow-primary/25 transition-all duration-300"
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  Generate with AI
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Creating Your Video</h2>
              <p className="text-muted-foreground">
                Our AI is crafting something special...
              </p>
            </div>

            {/* Processing Steps */}
            <div className="max-w-md mx-auto space-y-4">
              {PROCESSING_STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isCompleted = processingStep > idx;
                const isActive = processingStep === idx + 1;
                const isPending = processingStep <= idx;

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-500 ${
                      isCompleted
                        ? 'border-primary/50 bg-primary/5'
                        : isActive
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 animate-pulse'
                        : 'border-border bg-muted/30'
                    }`}
                    style={{
                      opacity: isPending ? 0.4 : 1,
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : isActive
                          ? 'bg-gradient-to-br from-primary to-accent text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isActive ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${isActive ? 'text-primary' : ''}`}>
                        {s.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isActive ? s.description : isCompleted ? 'Completed' : 'Waiting...'}
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mt-8">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                  style={{ width: `${(processingStep / PROCESSING_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {Math.round((processingStep / PROCESSING_STEPS.length) * 100)}% complete
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <div className="py-8 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Your Video is Ready!</h2>
              <p className="text-muted-foreground">
                Your AI-generated video has been created successfully
              </p>
            </div>

            {/* Video Preview Placeholder */}
            <Card className="max-w-3xl mx-auto border-border/50 shadow-2xl overflow-hidden">
              <div
                className="aspect-video bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center relative"
                style={{ aspectRatio }}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                    <Play className="h-10 w-10 text-primary ml-1" />
                  </div>
                  <p className="text-muted-foreground">Video Preview</p>
                  <Badge variant="outline" className="mt-2 bg-background/80">
                    {aspectRatio} • {duration === '180' ? '3min' : `${duration}s`}
                  </Badge>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-primary/80 backdrop-blur">{aspectRatio}</Badge>
                  <Badge variant="secondary" className="backdrop-blur">
                    {quality}% Quality
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Prompt Summary */}
            <Card className="max-w-3xl mx-auto mt-6 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Your prompt</p>
                    <p className="text-sm line-clamp-2">{prompt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button
                onClick={handleEditVideo}
                className="w-full sm:w-auto h-12 px-8 text-lg font-semibold bg-gradient-to-r from-[#6c3bff] to-[#00d4ff] hover:opacity-90 shadow-lg shadow-primary/25"
              >
                <Play className="h-5 w-5 mr-2" />
                Open Editor
              </Button>
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-lg"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                Create Another
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

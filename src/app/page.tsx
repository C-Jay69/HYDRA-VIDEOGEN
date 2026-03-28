'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Sparkles,
  Image,
  Music,
  Download,
  Layers,
  Zap,
  Globe,
  Shield,
  Play,
  Check,
  ChevronRight,
  Star,
  Users,
  Clock,
  Wand2,
  FileVideo,
  Type,
  Palette,
  Mic2,
  Share2
} from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'AI Video Generation',
    description: 'Transform text prompts into stunning videos instantly with our AI engine'
  },
  {
    icon: Layers,
    title: 'Timeline Editor',
    description: 'Full-featured timeline editor with drag-and-drop scenes and layers'
  },
  {
    icon: Image,
    title: 'AI Image Generation',
    description: 'Create custom images for your scenes using AI image synthesis'
  },
  {
    icon: Type,
    title: 'Text Overlays',
    description: 'Add animated text with custom fonts, colors, and effects'
  },
  {
    icon: Mic2,
    title: 'AI Voiceover',
    description: 'Generate natural-sounding voiceovers in 50+ languages'
  },
  {
    icon: Music,
    title: 'Stock Media Library',
    description: 'Access millions of royalty-free videos, images, and music tracks'
  },
  {
    icon: Palette,
    title: 'Brand Kit',
    description: 'Save and apply your brand colors, fonts, and logo across all videos'
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Export in multiple formats and share directly to social platforms'
  }
];

const templates = [
  { title: 'Tech Startup Promo', category: 'Marketing', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
  { title: 'Social Media Ad', category: 'Ads', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400' },
  { title: 'YouTube Intro', category: 'YouTube', image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400' },
  { title: 'Fashion Lookbook', category: 'Lifestyle', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { title: 'Product Showcase', category: 'E-commerce', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
  { title: 'Travel Vlog', category: 'Travel', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400' }
];

const stats = [
  { value: '10M+', label: 'Users' },
  { value: '50M+', label: 'Videos Created' },
  { value: '100+', label: 'Templates' },
  { value: '50+', label: 'Languages' }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Director',
    company: 'TechFlow Inc.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    content: 'This platform has cut our video production time by 80%. The AI features are incredible!'
  },
  {
    name: 'Marcus Johnson',
    role: 'Content Creator',
    company: '2M+ Subscribers',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    content: 'I create weekly content for my YouTube channel. This is my secret weapon for staying consistent.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Social Media Manager',
    company: 'Bloom Agency',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    content: 'Managing client social accounts is so much easier now. The template library is amazing.'
  }
];

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '5 exports per month',
      '720p video quality',
      'Basic templates',
      'Limited AI features',
      'Watermark on exports'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: 25,
    period: 'per month',
    description: 'Best for creators and marketers',
    features: [
      'Unlimited exports',
      '1080p video quality',
      'All premium templates',
      'Full AI access',
      'No watermark',
      'Priority support'
    ],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Business',
    price: 60,
    period: 'per month',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      '4K video quality',
      'Team collaboration',
      'Brand kit with 5 presets',
      'API access',
      'Dedicated support'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!user) {
      router.push('/login?redirect=/create');
      return;
    }

    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      router.push(`/create?prompt=${encodeURIComponent(prompt)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">VidAI</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Templates
                </Link>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explore
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="default" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" size="sm">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI-Powered Video Creation
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Turn Your Ideas
              </span>
              <br />
              <span>Into Stunning Videos</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Create professional videos in minutes with AI. No experience needed.
              Just describe your vision and watch the magic happen.
            </p>

            {/* AI Prompt Input */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-card border shadow-xl">
                <Input
                  placeholder="Describe your video... (e.g., 'Create a 60-second promo for my fitness app')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-base h-12 focus-visible:ring-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="h-12 px-8 gradient-button"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Try: &quot;Create a product demo video&quot; or &quot;Make a birthday slideshow&quot;
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link href="/templates">
                <Button variant="outline" size="lg" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Browse Templates
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" size="lg" className="gap-2">
                  <Play className="w-4 h-4" />
                  Start from Scratch
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Section */}
      <section className="py-20 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6 mx-auto cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-primary/25">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">See How It Works</h3>
                  <p className="text-muted-foreground">Create professional videos in under 5 minutes</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Create Amazing Videos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features wrapped in a simple interface. No learning curve required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className="py-20 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Start with Professional Templates
              </h2>
              <p className="text-muted-foreground">
                100+ templates for every use case, fully customizable
              </p>
            </div>
            <Link href="/templates">
              <Button variant="outline" className="gap-2 hidden sm:flex">
                View All Templates
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, i) => (
              <Card key={i} className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Play className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-0">
                    {template.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{template.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Click to use template</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/templates">
              <Button variant="outline" className="gap-2">
                View All Templates
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Create Videos in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              From idea to finished video in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Describe Your Vision</h3>
              <p className="text-muted-foreground">
                Type a prompt or choose a template. Our AI understands what you need.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Customize & Edit</h3>
              <p className="text-muted-foreground">
                Fine-tune every detail with our intuitive editor. Add text, media, and effects.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Export & Share</h3>
              <p className="text-muted-foreground">
                Download in any format or share directly to social media platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Creators Worldwide
            </h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-muted-foreground">4.9/5 from 10,000+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card
                key={i}
                className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.price === 0 ? '/signup' : plan.price === 60 ? '/contact' : '/signup?plan=pro'}>
                    <Button
                      variant={plan.popular ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center mt-8 text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Amazing Videos?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join millions of creators making professional videos with AI
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-primary font-semibold">
              Start Creating for Free
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">VidAI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered video creation for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/templates" className="hover:text-foreground">Templates</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/integrations" className="hover:text-foreground">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/tutorials" className="hover:text-foreground">Tutorials</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/api" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/press" className="hover:text-foreground">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              2026 VidAI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .gradient-button {
          background: linear-gradient(135deg, #6c3bff 0%, #00d4ff 100%);
        }
        .gradient-button:hover {
          background: linear-gradient(135deg, #5b2ee6 0%, #00bfe6 100%);
        }
      `}</style>
    </div>
  );
}

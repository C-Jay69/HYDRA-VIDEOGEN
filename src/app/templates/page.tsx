"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Play, Clock, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

type Template = {
  id: string;
  title: string;
  thumbnail_url: string;
  category: string;
  duration: number;
  aspect_ratio: string;
  created_at: string;
};

const CATEGORIES = [
  "All",
  "Marketing",
  "Social Media",
  "YouTube",
  "Real Estate",
  "E-commerce",
  "Education",
];

const ASPECT_RATIOS = [
  { value: "all", label: "All Sizes" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "1:1", label: "1:1" },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("all");

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      template.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesAspectRatio =
      selectedAspectRatio === "all" ||
      template.aspect_ratio === selectedAspectRatio;

    return matchesSearch && matchesCategory && matchesAspectRatio;
  });

  const handleUseTemplate = (templateId: string) => {
    router.push(`/editor?template=${templateId}`);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Marketing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "Social Media":
        "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      YouTube: "bg-red-500/10 text-red-500 border-red-500/20",
      "Real Estate":
        "bg-green-500/10 text-green-500 border-green-500/20",
      "E-commerce": "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Education: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Template Gallery
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover the perfect template for your video
              </p>
            </div>
            <Badge
              variant="secondary"
              className="hidden sm:flex items-center gap-1 px-3 py-1"
            >
              <LayoutGrid className="h-3 w-3" />
              {filteredTemplates.length} templates
            </Badge>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/80"
              />
            </div>

            {/* Category Tabs */}
            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
                {CATEGORIES.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Aspect Ratio Filter */}
            <div className="flex gap-2 flex-wrap">
              {ASPECT_RATIOS.map((ratio) => (
                <Button
                  key={ratio.value}
                  variant={selectedAspectRatio === ratio.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAspectRatio(ratio.value)}
                  className={
                    selectedAspectRatio === ratio.value
                      ? "bg-primary hover:bg-primary/90"
                      : ""
                  }
                >
                  {ratio.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search or filters to find what you are looking
              for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                onClick={() => handleUseTemplate(template.id)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      <Play className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  {/* Duration Badge */}
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/70 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {formatDuration(template.duration)}
                  </Badge>
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-200">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Title */}
                    <h3 className="font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>

                    {/* Category Badge */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getCategoryColor(template.category)}`}
                      >
                        {template.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {template.aspect_ratio}
                      </span>
                    </div>

                    {/* Use Template Button */}
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template.id);
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

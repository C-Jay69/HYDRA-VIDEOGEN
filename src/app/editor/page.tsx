'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Copy,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Type,
  Image,
  Music,
  Download,
  Save,
  ChevronLeft,
  ChevronRight,
  Settings,
  GripVertical,
  Video,
  MoreVertical,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Scene {
  id: string;
  project_id: string;
  order_index: number;
  background_url: string | null;
  background_type: string;
  background_color: string;
  voiceover_text: string | null;
  voice_id: string;
  speed: number;
  volume: number;
  duration_seconds: number;
  created_at: string;
}

interface TextOverlay {
  id: string;
  scene_id: string;
  content: string;
  font_family: string;
  font_size: number;
  color: string;
  position_x: number;
  position_y: number;
  animation_type: string;
  text_align: string;
}

interface HistoryState {
  scenes: Scene[];
  textOverlays: { [sceneId: string]: TextOverlay[] };
}

function VideoEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const projectId = searchParams.get('project');
  const templateId = searchParams.get('template');

  const [project, setProject] = useState<any>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [textOverlays, setTextOverlays] = useState<{ [sceneId: string]: TextOverlay[] }>({});
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectedScene = useMemo(() =>
    scenes.find(s => s.id === selectedSceneId),
    [scenes, selectedSceneId]
  );

  const selectedOverlays = useMemo(() =>
    selectedSceneId ? textOverlays[selectedSceneId] || [] : [],
    [textOverlays, selectedSceneId]
  );

  const totalDuration = useMemo(() =>
    scenes.reduce((acc, s) => acc + (s.duration_seconds || 5), 0),
    [scenes]
  );

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/editor');
    }
  }, [user, authLoading, router]);

  // Load project data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      if (projectId) {
        // Load existing project
        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .maybeSingle();

        console.log('Project data:', projectData);

        if (projectData) {
          setProject(projectData);

          const { data: scenesData, error: scenesError } = await supabase
            .from('scenes')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');

          console.log('Scenes data:', scenesData, 'Error:', scenesError);

          if (scenesData && scenesData.length > 0) {
            setScenes(scenesData);
            setSelectedSceneId(scenesData[0].id);

            // Load text overlays for each scene
            const overlayPromises = scenesData.map(async (scene) => {
              const { data: overlays } = await supabase
                .from('text_overlays')
                .select('*')
                .eq('scene_id', scene.id);
              return { sceneId: scene.id, overlays: overlays || [] };
            });

            const overlayResults = await Promise.all(overlayPromises);
            const overlaysMap: { [key: string]: TextOverlay[] } = {};
            overlayResults.forEach(({ sceneId, overlays }) => {
              overlaysMap[sceneId] = overlays;
            });
            setTextOverlays(overlaysMap);
          }
        }
      } else {
        // Create new project
        const { data: newProject } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            title: 'Untitled Project',
            status: 'draft',
            aspect_ratio: '16:9',
            duration_seconds: 0,
          })
          .select()
          .maybeSingle();

        if (newProject) {
          setProject(newProject);
          // Create initial scene
          const { data: newScene } = await supabase
            .from('scenes')
            .insert({
              project_id: newProject.id,
              order_index: 0,
              background_type: 'color',
              background_color: '#1a1a2e',
              duration_seconds: 5,
              voice_id: 'en-US-Standard-A',
            })
            .select()
            .maybeSingle();

          if (newScene) {
            setScenes([newScene]);
            setSelectedSceneId(newScene.id);
          }
        }
      }
    };

    loadData();
  }, [user, projectId, templateId]);

  // Save to history
  const saveHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      scenes: JSON.parse(JSON.stringify(scenes)),
      textOverlays: JSON.parse(JSON.stringify(textOverlays)),
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, scenes, textOverlays]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setScenes(prevState.scenes);
      setTextOverlays(prevState.textOverlays);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setScenes(nextState.scenes);
      setTextOverlays(nextState.textOverlays);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Save project
  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);

    await supabase
      .from('projects')
      .update({
        title: project.title,
        duration_seconds: totalDuration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id);

    setIsSaving(false);
    setSaveDialogOpen(false);
  };

  // Add scene
  const handleAddScene = async () => {
    if (!project) return;
    saveHistory();

    const newScene: Scene = {
      id: crypto.randomUUID(),
      project_id: project.id,
      order_index: scenes.length,
      background_url: null,
      background_type: 'color',
      background_color: '#2a2a4a',
      voiceover_text: null,
      voice_id: 'en-US-Standard-A',
      speed: 1,
      volume: 1,
      duration_seconds: 5,
      created_at: new Date().toISOString(),
    };

    const { data } = await supabase
      .from('scenes')
      .insert(newScene)
      .select()
      .maybeSingle();

    if (data) {
      setScenes([...scenes, data]);
      setSelectedSceneId(data.id);
      setTextOverlays({ ...textOverlays, [data.id]: [] });
    }
  };

  // Delete scene
  const handleDeleteScene = async (sceneId: string) => {
    saveHistory();
    await supabase.from('scenes').delete().eq('id', sceneId);

    const newScenes = scenes.filter(s => s.id !== sceneId);
    setScenes(newScenes);

    const newOverlays = { ...textOverlays };
    delete newOverlays[sceneId];
    setTextOverlays(newOverlays);

    if (selectedSceneId === sceneId && newScenes.length > 0) {
      setSelectedSceneId(newScenes[0].id);
    }
  };

  // Update scene
  const handleUpdateScene = async (sceneId: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s));
    await supabase
      .from('scenes')
      .update(updates)
      .eq('id', sceneId);
  };

  // Add text overlay
  const handleAddTextOverlay = async () => {
    if (!selectedSceneId) return;
    saveHistory();

    const newOverlay: TextOverlay = {
      id: crypto.randomUUID(),
      scene_id: selectedSceneId,
      content: 'New Text',
      font_family: 'Inter',
      font_size: 32,
      color: '#ffffff',
      position_x: 0.5,
      position_y: 0.5,
      animation_type: 'fade-in',
      text_align: 'center',
    };

    const { data } = await supabase
      .from('text_overlays')
      .insert(newOverlay)
      .select()
      .maybeSingle();

    if (data) {
      setTextOverlays({
        ...textOverlays,
        [selectedSceneId]: [...(textOverlays[selectedSceneId] || []), data],
      });
    }
  };

  // Update text overlay
  const handleUpdateTextOverlay = async (overlayId: string, updates: Partial<TextOverlay>) => {
    if (!selectedSceneId) return;

    const newOverlays = (textOverlays[selectedSceneId] || []).map(o =>
      o.id === overlayId ? { ...o, ...updates } : o
    );
    setTextOverlays({ ...textOverlays, [selectedSceneId]: newOverlays });

    await supabase
      .from('text_overlays')
      .update(updates)
      .eq('id', overlayId);
  };

  // Delete text overlay
  const handleDeleteTextOverlay = async (overlayId: string) => {
    if (!selectedSceneId) return;
    saveHistory();

    await supabase.from('text_overlays').delete().eq('id', overlayId);

    setTextOverlays({
      ...textOverlays,
      [selectedSceneId]: (textOverlays[selectedSceneId] || []).filter(o => o.id !== overlayId),
    });
  };

  // Playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a14]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a14] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 bg-[#13132a] border-b border-[#2a2a4a] flex items-center px-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="text-white/70 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="text-white/70 hover:text-white"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="text-white/70 hover:text-white"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.max(50, prev - 25))}
            className="text-white/70 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-white/70 w-12 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.min(200, prev + 25))}
            className="text-white/70 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          className="border-[#6c3bff] text-[#6c3bff] hover:bg-[#6c3bff]/10"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          variant="default"
          size="sm"
          className="bg-gradient-to-r from-[#6c3bff] to-[#00d4ff]"
          onClick={() => router.push('/export')}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Scenes */}
        <div className="w-64 bg-[#13132a] border-r border-[#2a2a4a] flex flex-col">
          <div className="p-4 border-b border-[#2a2a4a] flex items-center justify-between">
            <h3 className="font-semibold">Scenes</h3>
            <Button variant="ghost" size="icon" onClick={handleAddScene}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                className={cn(
                  'p-2 rounded-lg cursor-pointer transition-all',
                  selectedSceneId === scene.id
                    ? 'bg-[#6c3bff]/20 border border-[#6c3bff]'
                    : 'bg-[#1a1a2e] hover:bg-[#2a2a4a] border border-transparent'
                )}
                onClick={() => setSelectedSceneId(scene.id)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-white/30" />
                  {scene.background_type === 'video' && scene.background_url ? (
                    <div className="relative w-16 h-9 rounded flex-shrink-0 overflow-hidden bg-black">
                      <video
                        src={scene.background_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : scene.background_type === 'image' && scene.background_url ? (
                    <div
                      className="w-16 h-9 rounded flex-shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${scene.background_url})` }}
                    />
                  ) : (
                    <div
                      className="w-16 h-9 rounded flex-shrink-0"
                      style={{ backgroundColor: scene.background_color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Scene {index + 1}</p>
                    <p className="text-xs text-white/50">{scene.duration_seconds}s</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScene(scene.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col bg-[#0a0a14]">
          {/* Preview */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
              style={{ aspectRatio: project?.aspect_ratio || '16:9' }}
            >
              {/* Background */}
              {selectedScene?.background_type === 'video' && selectedScene?.background_url ? (
                <video
                  key={selectedScene.background_url}
                  src={selectedScene.background_url}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={(e) => console.error('Video error:', e)}
                  onLoadedData={() => console.log('Video loaded:', selectedScene.background_url)}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: selectedScene?.background_color || '#1a1a2e',
                    backgroundImage: selectedScene?.background_type === 'image' && selectedScene?.background_url ? `url(${selectedScene.background_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

              {/* Text overlays */}
              {selectedOverlays.map(overlay => (
                <div
                  key={overlay.id}
                  className={cn(
                    'absolute',
                    overlay.animation_type === 'fade-in' && 'animate-fade-in',
                    overlay.animation_type === 'slide-up' && 'animate-slide-up'
                  )}
                  style={{
                    left: `${overlay.position_x * 100}%`,
                    top: `${overlay.position_y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    fontFamily: overlay.font_family,
                    fontSize: `${overlay.font_size}px`,
                    color: overlay.color,
                    textAlign: overlay.text_align as any,
                  }}
                >
                  {overlay.content}
                </div>
              ))}

              {/* Scene number indicator */}
              <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-xs">
                Scene {scenes.findIndex(s => s.id === selectedSceneId) + 1} / {scenes.length}
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="h-16 bg-[#13132a] border-t border-[#2a2a4a] flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentTime(0)}
              className="text-white/70 hover:text-white"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full bg-[#6c3bff] hover:bg-[#5b2ee6]"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentTime(totalDuration)}
              className="text-white/70 hover:text-white"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <span className="text-sm text-white/70 ml-4">
              {Math.floor(currentTime)}s / {totalDuration}s
            </span>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 bg-[#13132a] border-l border-[#2a2a4a] flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-[#2a2a4a]">
            <h3 className="font-semibold">Properties</h3>
          </div>

          {selectedScene && (
            <div className="p-4 space-y-6">
              {/* Scene Settings */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-white/70">Scene</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Duration (seconds)</label>
                    <Input
                      type="number"
                      value={selectedScene.duration_seconds}
                      onChange={(e) => handleUpdateScene(selectedScene.id, { duration_seconds: parseInt(e.target.value) || 5 })}
                      className="bg-[#1a1a2e] border-[#2a2a4a]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedScene.background_color}
                        onChange={(e) => handleUpdateScene(selectedScene.id, { background_color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent"
                      />
                      <Input
                        value={selectedScene.background_color}
                        onChange={(e) => handleUpdateScene(selectedScene.id, { background_color: e.target.value })}
                        className="flex-1 bg-[#1a1a2e] border-[#2a2a4a]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Overlays */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white/70">Text Overlays</h4>
                  <Button variant="ghost" size="sm" onClick={handleAddTextOverlay}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedOverlays.map((overlay, index) => (
                    <div key={overlay.id} className="bg-[#1a1a2e] rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Text {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteTextOverlay(overlay.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        value={overlay.content}
                        onChange={(e) => handleUpdateTextOverlay(overlay.id, { content: e.target.value })}
                        className="bg-[#2a2a4a] border-0 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-white/50">Size</label>
                          <Input
                            type="number"
                            value={overlay.font_size}
                            onChange={(e) => handleUpdateTextOverlay(overlay.id, { font_size: parseInt(e.target.value) || 32 })}
                            className="bg-[#2a2a4a] border-0 text-sm h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Color</label>
                          <input
                            type="color"
                            value={overlay.color}
                            onChange={(e) => handleUpdateTextOverlay(overlay.id, { color: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer bg-[#2a2a4a]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voiceover */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-white/70">Voiceover</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Voice Text</label>
                    <Textarea
                      value={selectedScene.voiceover_text || ''}
                      onChange={(e) => handleUpdateScene(selectedScene.id, { voiceover_text: e.target.value })}
                      placeholder="Enter voiceover text..."
                      className="bg-[#1a1a2e] border-[#2a2a4a] text-sm h-20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Voice</label>
                    <Select
                      value={selectedScene.voice_id}
                      onValueChange={(v) => handleUpdateScene(selectedScene.id, { voice_id: v })}
                    >
                      <SelectTrigger className="bg-[#1a1a2e] border-[#2a2a4a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US-Standard-A">English US - Standard A</SelectItem>
                        <SelectItem value="en-US-Standard-B">English US - Standard B</SelectItem>
                        <SelectItem value="en-GB-Standard-A">English UK - Standard A</SelectItem>
                        <SelectItem value="es-ES-Standard-A">Spanish - Standard A</SelectItem>
                        <SelectItem value="fr-FR-Standard-A">French - Standard A</SelectItem>
                        <SelectItem value="de-DE-Standard-A">German - Standard A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="h-40 bg-[#13132a] border-t border-[#2a2a4a]">
        <div className="h-8 bg-[#1a1a2e] border-b border-[#2a2a4a] flex items-center px-4">
          <span className="text-xs text-white/50">Timeline</span>
        </div>
        <div className="h-[calc(100%-32px)] overflow-x-auto p-4">
          <div
            className="h-full flex gap-1"
            style={{ width: `${(totalDuration * zoom) / 100 * 50}px`, minWidth: '100%' }}
          >
            {/* Scene track */}
            <div className="absolute bottom-20 left-4 right-4 h-16 flex gap-1">
              {scenes.map((scene, index) => {
                const sceneStart = scenes.slice(0, index).reduce((acc, s) => acc + (s.duration_seconds || 5), 0);
                const width = (scene.duration_seconds || 5) * (zoom / 100) * 50;
                return (
                  <div
                    key={scene.id}
                    className={cn(
                      'h-12 rounded cursor-pointer flex items-center justify-center text-xs font-medium',
                      selectedSceneId === scene.id
                        ? 'bg-[#6c3bff]'
                        : 'bg-[#2a2a4a] hover:bg-[#3a3a5a]'
                    )}
                    style={{ width: `${width}px` }}
                    onClick={() => setSelectedSceneId(scene.id)}
                  >
                    S{index + 1}
                  </div>
                );
              })}
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: `${(currentTime * zoom) / 100 * 50}px` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-[#13132a] border-[#2a2a4a]">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Save all changes to your project. Changes are automatically saved as you edit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Confirm Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translate(-50%, -30%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#0a0a14]">
        <div className="text-white">Loading editor...</div>
      </div>
    }>
      <VideoEditorContent />
    </Suspense>
  );
}

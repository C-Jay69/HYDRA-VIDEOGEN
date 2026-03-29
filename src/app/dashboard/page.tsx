'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Play, Plus, MoreVertical, Edit, Copy, Trash2, Download, Film, Sparkles } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  thumbnail_url: string | null;
  status: 'draft' | 'rendering' | 'ready';
  user_id: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  draft: 'bg-gray-500/10 text-gray-500 border-gray-500',
  rendering: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
  ready: 'bg-green-500/10 text-green-500 border-green-500',
};

const statusLabels = {
  draft: 'Draft',
  rendering: 'Rendering',
  ready: 'Ready',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch projects
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const { error } = await supabase.from('projects').insert({
        title: `${project.title} (Copy)`,
        user_id: user!.id,
        status: 'draft',
        thumbnail_url: project.thumbnail_url,
      });

      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error('Error duplicating project:', error);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);

      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || (isLoading && user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
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

    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/video-gen">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Video Gen
            </Link>
          </Button>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              New Video
            </Link>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Film className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Create your first video project to get started with AI-powered video creation.
          </p>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Video
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {project.thumbnail_url ? (
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                {/* Play button overlay */}
                {project.status === 'ready' && (
                  <Link
                    href={`/project/${project.id}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="rounded-full bg-white/90 p-3">
                      <Play className="h-6 w-6 text-black fill-black" />
                    </div>
                  </Link>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1" title={project.title}>
                      {project.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${statusColors[project.status]}`}
                    >
                      {statusLabels[project.status]}
                    </Badge>
                  </div>

                  {/* Last Updated */}
                  <p className="text-sm text-muted-foreground">
                    Updated {formatDate(project.updated_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {project.status === 'ready' && (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/project/${project.id}`}>
                          <Play className="mr-1 h-3 w-3" />
                          Play
                        </Link>
                      </Button>
                    )}
                    {project.status === 'draft' && (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/edit/${project.id}`}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {project.status === 'draft' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/edit/${project.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicate(project)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {project.status === 'ready' && (
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(project)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.title}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}

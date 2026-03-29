'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseAdmin } from '@/integrations/supabase/server';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Film,
  Download,
  CreditCard,
  Search,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Database,
  Loader2,
  Shield,
  LayoutDashboard,
  Settings,
  BarChart3,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  XCircle,
  CheckCircle,
} from 'lucide-react';

// Types
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  plan: 'free' | 'pro' | 'business';
  is_admin: boolean;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
  project_count?: number;
}

interface Project {
  id: string;
  title: string;
  status: 'draft' | 'rendering' | 'ready';
  user_id: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

interface Export {
  id: string;
  project_id: string;
  project_title?: string;
  user_id: string;
  user_email?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: string;
  resolution: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalExports: number;
  activeSubscriptions: number;
}

interface DailyStats {
  date: string;
  users: number;
  projects: number;
  exports: number;
}

// Login Component
function AdminLogin({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<boolean>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const success = await onLogin(email, password);
    if (!success) {
      setError('Invalid admin credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e] p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription className="text-base">
            HYDRA-VIDEOGEN Administration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Admin Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Stats Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// User Management Component
function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('email', `%${search}%`);
      }

      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch project counts for each user
      const usersWithCounts = await Promise.all(
        (data || []).map(async (user) => {
          const { count: projectCount } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          return { ...user, project_count: projectCount || 0 };
        })
      );

      setUsers(usersWithCounts);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ plan: newPlan, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleDisable = async (user: UserProfile) => {
    setIsUpdating(true);
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_disabled: !user.is_disabled, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const planColors = {
    free: 'bg-gray-500/10 text-gray-500 border-gray-500',
    pro: 'bg-purple-500/10 text-purple-500 border-purple-500',
    business: 'bg-cyan-500/10 text-cyan-500 border-cyan-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.plan}
                        onValueChange={(value) => handleUpdatePlan(user.id, value)}
                        disabled={isUpdating || user.is_admin}
                      >
                        <SelectTrigger className={`w-[100px] ${planColors[user.plan]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{user.project_count}</TableCell>
                    <TableCell>
                      {user.is_disabled ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!user.is_admin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleDisable(user)}
                            disabled={isUpdating}
                          >
                            {user.is_disabled ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">{selectedUser.plan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projects</p>
                  <p className="font-medium">{selectedUser.project_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {selectedUser.is_disabled ? 'Disabled' : 'Active'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Admin</p>
                  <p className="font-medium">{selectedUser.is_admin ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
            {!selectedUser?.is_admin && (
              <Button
                variant={selectedUser?.is_disabled ? 'default' : 'destructive'}
                onClick={() => selectedUser && handleToggleDisable(selectedUser)}
                disabled={isUpdating}
              >
                {selectedUser?.is_disabled ? 'Enable Account' : 'Disable Account'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Projects Management Component
function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabaseAdmin
        .from('projects')
        .select('*, profiles(email)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const projectsWithEmail = (data || []).map((p) => ({
        ...p,
        user_email: (p.profiles as any)?.email,
      }));

      setProjects(projectsWithEmail);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabaseAdmin
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

  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-500 border-gray-500',
    rendering: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
    ready: 'bg-green-500/10 text-green-500 border-green-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="rendering">Rendering</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchProjects}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {project.title}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {project.user_email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[project.status]}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(project.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(project.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setProjectToDelete(project);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Analytics Component
function Analytics() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Get last 7 days stats
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const stats: DailyStats[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          // Count users
          const { count: userCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dateStr)
            .lt('created_at', nextDate.toISOString().split('T')[0]);

          // Count projects
          const { count: projectCount } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dateStr)
            .lt('created_at', nextDate.toISOString().split('T')[0]);

          // Count exports
          const { count: exportCount } = await supabaseAdmin
            .from('exports')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dateStr)
            .lt('created_at', nextDate.toISOString().split('T')[0]);

          stats.push({
            date: dateStr,
            users: userCount || 0,
            projects: projectCount || 0,
            exports: exportCount || 0,
          });
        }

        setDailyStats(stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const maxUsers = Math.max(...dailyStats.map((s) => s.users), 1);
  const maxProjects = Math.max(...dailyStats.map((s) => s.projects), 1);
  const maxExports = Math.max(...dailyStats.map((s) => s.exports), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dailyStats.map((stat) => (
          <Card key={stat.date}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {new Date(stat.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Users</span>
                  <span className="font-bold">{stat.users}</span>
                </div>
                <Progress value={(stat.users / maxUsers) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Projects</span>
                  <span className="font-bold">{stat.projects}</span>
                </div>
                <Progress value={(stat.projects / maxProjects) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Exports</span>
                  <span className="font-bold">{stat.exports}</span>
                </div>
                <Progress value={(stat.exports / maxExports) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Maintenance Component
function Maintenance() {
  const [clearProjectsOpen, setClearProjectsOpen] = useState(false);
  const [clearTestDataOpen, setClearTestDataOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    checkDbStatus();
    fetchProjectCount();
  }, []);

  const checkDbStatus = async () => {
    setDbStatus('checking');
    try {
      const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
      setDbStatus(error ? 'error' : 'ok');
    } catch {
      setDbStatus('error');
    }
  };

  const fetchProjectCount = async () => {
    const { count } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true });
    setProjectCount(count || 0);
  };

  const handleClearProjects = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabaseAdmin.from('projects').delete().neq('id', '');
      if (error) throw error;
      setClearProjectsOpen(false);
      fetchProjectCount();
    } catch (error) {
      console.error('Error clearing projects:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearTestData = async () => {
    setIsClearing(true);
    try {
      // Delete test projects (projects with 'test' in title, older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error } = await supabaseAdmin
        .from('projects')
        .delete()
        .like('title', '%test%')
        .lt('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;
      setClearTestDataOpen(false);
      fetchProjectCount();
    } catch (error) {
      console.error('Error clearing test data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Database Status</CardTitle>
            <Database className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {dbStatus === 'checking' && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              {dbStatus === 'ok' && (
                <div className="h-3 w-3 rounded-full bg-green-500" />
              )}
              {dbStatus === 'error' && (
                <div className="h-3 w-3 rounded-full bg-destructive" />
              )}
              <span className="font-medium">
                {dbStatus === 'checking' && 'Checking...'}
                {dbStatus === 'ok' && 'Connected'}
                {dbStatus === 'error' && 'Connection Error'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkDbStatus}
                disabled={dbStatus === 'checking'}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Total Projects</CardTitle>
            <Film className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projectCount}</div>
            <p className="text-sm text-muted-foreground mt-1">in database</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maintenance Actions</CardTitle>
          <CardDescription>
            Perform database maintenance operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Clear All Projects</p>
              <p className="text-sm text-muted-foreground">
                Delete all projects from the database. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setClearProjectsOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Clear Test Data</p>
              <p className="text-sm text-muted-foreground">
                Delete projects with &quot;test&quot; in title older than 7 days.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setClearTestDataOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Test Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear Projects Dialog */}
      <Dialog open={clearProjectsOpen} onOpenChange={setClearProjectsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear All Projects
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all {projectCount} projects from the database.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearProjectsOpen(false)} disabled={isClearing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearProjects} disabled={isClearing}>
              {isClearing ? 'Clearing...' : 'Clear All Projects'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Test Data Dialog */}
      <Dialog open={clearTestDataOpen} onOpenChange={setClearTestDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Test Data</DialogTitle>
            <DialogDescription>
              Delete all test projects older than 7 days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearTestDataOpen(false)} disabled={isClearing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearTestData} disabled={isClearing}>
              {isClearing ? 'Clearing...' : 'Clear Test Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main Admin Dashboard
function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProjects: 0,
    totalExports: 0,
    activeSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersCount, projectsCount, exportsCount, subscriptionsCount] = await Promise.all([
          supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('exports').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).in('plan', ['pro', 'business']),
        ]);

        setStats({
          totalUsers: usersCount.count || 0,
          totalProjects: projectsCount.count || 0,
          totalExports: exportsCount.count || 0,
          activeSubscriptions: subscriptionsCount.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Admin Portal</h1>
                <p className="text-xs text-muted-foreground">HYDRA-VIDEOGEN</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem('admin_session');
                window.location.reload();
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={isLoading ? '...' : stats.totalUsers}
              icon={Users}
            />
            <StatCard
              title="Total Projects"
              value={isLoading ? '...' : stats.totalProjects}
              icon={Film}
            />
            <StatCard
              title="Total Exports"
              value={isLoading ? '...' : stats.totalExports}
              icon={Download}
            />
            <StatCard
              title="Active Subscriptions"
              value={isLoading ? '...' : stats.activeSubscriptions}
              icon={CreditCard}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <Film className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects Management</CardTitle>
                <CardDescription>
                  View and manage all video projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Platform usage statistics for the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Analytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>
                  Database maintenance and cleanup operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Maintenance />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Main Admin Page Component
function AdminPageContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if already logged in
    const session = localStorage.getItem('admin_session');
    if (session) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Get admin credentials from environment variables via API
    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@hydra-videogen.com';
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

      if (email === adminEmail && password === adminPassword) {
        localStorage.setItem('admin_session', 'true');
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard />;
}

// Wrapper with Suspense
export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette, Plus, Edit, Trash2, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

const GOOGLE_FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
];

interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  heading_font: string;
  body_font: string;
  created_at: string;
  updated_at: string;
}

interface BrandKitFormData {
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  heading_font: string;
  body_font: string;
}

export default function BrandKitPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<BrandKitFormData>({
    name: '',
    logo_url: null,
    primary_color: '#6c3bff',
    secondary_color: '#00d4ff',
    heading_font: 'Inter',
    body_font: 'Open Sans',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchBrandKits = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrandKits(data || []);
    } catch (error) {
      console.error('Error fetching brand kits:', error);
      toast.error('Failed to load brand kits');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchBrandKits();
    }
  }, [user, authLoading, router, fetchBrandKits]);

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: null,
      primary_color: '#6c3bff',
      secondary_color: '#00d4ff',
      heading_font: 'Inter',
      body_font: 'Open Sans',
    });
    setLogoPreview(null);
    setEditingKit(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (kit: BrandKit) => {
    setEditingKit(kit);
    setFormData({
      name: kit.name,
      logo_url: kit.logo_url,
      primary_color: kit.primary_color,
      secondary_color: kit.secondary_color,
      heading_font: kit.heading_font,
      body_font: kit.body_font,
    });
    setLogoPreview(kit.logo_url);
    setDialogOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      setFormData((prev) => ({ ...prev, logo_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) {
      toast.error('Please enter a name for the brand kit');
      return;
    }

    setIsSaving(true);
    try {
      if (editingKit) {
        const { error } = await supabase
          .from('brand_kits')
          .update({
            name: formData.name,
            logo_url: formData.logo_url,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            heading_font: formData.heading_font,
            body_font: formData.body_font,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingKit.id);

        if (error) throw error;
        toast.success('Brand kit updated successfully');
      } else {
        const { error } = await supabase.from('brand_kits').insert({
          user_id: user.id,
          name: formData.name,
          logo_url: formData.logo_url,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          heading_font: formData.heading_font,
          body_font: formData.body_font,
        });

        if (error) throw error;
        toast.success('Brand kit created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchBrandKits();
    } catch (error) {
      console.error('Error saving brand kit:', error);
      toast.error('Failed to save brand kit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (kit: BrandKit) => {
    if (!confirm(`Are you sure you want to delete "${kit.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('brand_kits')
        .delete()
        .eq('id', kit.id);

      if (error) throw error;
      toast.success('Brand kit deleted successfully');
      fetchBrandKits();
    } catch (error) {
      console.error('Error deleting brand kit:', error);
      toast.error('Failed to delete brand kit');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#6c3bff' }}>
            <Palette className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Brand Kits</h1>
        </div>
        <Button
          onClick={openCreateDialog}
          style={{ backgroundColor: '#6c3bff' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Brand Kit
        </Button>
      </div>

      {brandKits.length === 0 ? (
        <Card className="p-12 text-center">
          <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No brand kits yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first brand kit to maintain consistent video branding
          </p>
          <Button
            onClick={openCreateDialog}
            style={{ backgroundColor: '#6c3bff' }}
            className="hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Brand Kit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandKits.map((kit) => (
            <Card key={kit.id} className="overflow-hidden">
              <div
                className="h-32 relative"
                style={{
                  background: `linear-gradient(135deg, ${kit.primary_color} 0%, ${kit.secondary_color} 100%)`,
                }}
              >
                {kit.logo_url && (
                  <img
                    src={kit.logo_url}
                    alt={kit.name}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                  />
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{kit.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(kit)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(kit)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: kit.primary_color }}
                    title="Primary Color"
                  />
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: kit.secondary_color }}
                    title="Secondary Color"
                  />
                  <span className="text-xs text-muted-foreground ml-2">
                    {kit.heading_font} / {kit.body_font}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingKit ? 'Edit Brand Kit' : 'Create Brand Kit'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter brand kit name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="logo-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-12 w-auto rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setFormData((prev) => ({ ...prev, logo_url: null }));
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="primary-color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primary_color: e.target.value,
                      }))
                    }
                    className="w-12 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primary_color: e.target.value,
                      }))
                    }
                    placeholder="#6c3bff"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="secondary-color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secondary_color: e.target.value,
                      }))
                    }
                    className="w-12 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        secondary_color: e.target.value,
                      }))
                    }
                    placeholder="#00d4ff"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select
                  value={formData.heading_font}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, heading_font: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select heading font" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select
                  value={formData.body_font}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, body_font: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body font" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="p-6 rounded-lg border"
                style={{
                  background: `linear-gradient(135deg, ${formData.primary_color}20 0%, ${formData.secondary_color}20 100%)`,
                  borderColor: `${formData.primary_color}40`,
                }}
              >
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="h-10 w-auto object-contain"
                      />
                    )}
                    <h3
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: formData.heading_font,
                        color: formData.primary_color,
                      }}
                    >
                      {formData.name || 'Brand Title'}
                    </h3>
                  </div>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: formData.body_font,
                      color: '#666',
                    }}
                  >
                    This is how your video content will look with this brand kit.
                    The heading uses {formData.heading_font} font while the body
                    text uses {formData.body_font}.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-white text-sm font-medium"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      Primary Button
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md text-sm font-medium border"
                      style={{
                        borderColor: formData.secondary_color,
                        color: formData.secondary_color,
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: '#6c3bff' }}
                className="hover:opacity-90"
              >
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {editingKit ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

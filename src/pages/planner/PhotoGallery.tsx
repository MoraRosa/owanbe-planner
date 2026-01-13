import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Image, Trash2, X, Upload, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
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
import { useAuth } from '@/hooks/useAuth';
import { getUserEvents, initDB, saveEventPhoto, getEventPhotos, deleteEventPhoto } from '@/lib/indexedDb';
import type { PlannerEvent } from '@/types/planner';
import type { EventPhoto } from '@/types/timeline';
import { getCategoryIcon } from '@/types/planner';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PhotoGallery() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [photos, setPhotos] = useState<Record<string, EventPhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [viewingPhoto, setViewingPhoto] = useState<EventPhoto | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadEventId, setUploadEventId] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    if (!user) return;
    await initDB();
    
    const userEvents = await getUserEvents(user.id);
    userEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEvents(userEvents);
    
    // Load photos for each event
    const photosMap: Record<string, EventPhoto[]> = {};
    for (const event of userEvents) {
      const eventPhotos = await getEventPhotos(event.id);
      photosMap[event.id] = eventPhotos.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    }
    setPhotos(photosMap);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadEventId || !uploadPreview) {
      toast.error('Please select an event and image');
      return;
    }

    try {
      await saveEventPhoto({
        eventId: uploadEventId,
        imageUrl: uploadPreview,
        caption: uploadCaption,
      });
      toast.success('Photo uploaded!');
      setIsUploadDialogOpen(false);
      setUploadPreview('');
      setUploadCaption('');
      setUploadEventId('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadData();
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await deleteEventPhoto(photoId);
      toast.success('Photo deleted');
      setViewingPhoto(null);
      loadData();
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  const handleDownload = (photo: EventPhoto) => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `photo_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (photo: EventPhoto) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.caption || 'Event Photo',
          text: 'Check out this photo from my event!',
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      toast.info('Sharing not supported on this device');
    }
  };

  const getAllPhotos = (): EventPhoto[] => {
    if (selectedEventId === 'all') {
      return Object.values(photos).flat().sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    }
    return photos[selectedEventId] || [];
  };

  const displayPhotos = getAllPhotos();
  const totalPhotos = Object.values(photos).flat().length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-full bg-pattern-ankara" style={{ backgroundBlendMode: 'overlay', backgroundColor: 'hsl(35 30% 97% / 0.7)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Photo Gallery</h1>
          <p className="text-muted-foreground mt-1">
            {totalPhotos} {totalPhotos === 1 ? 'photo' : 'photos'} across {events.length} events
          </p>
        </div>
        <Button 
          className="btn-coral gap-2"
          onClick={() => {
            if (events.length === 0) {
              toast.error('Create an event first');
              return;
            }
            setIsUploadDialogOpen(true);
          }}
        >
          <Upload className="w-5 h-5" />
          Upload Photo
        </Button>
      </div>

      {/* Filter */}
      {events.length > 0 && (
        <div className="flex items-center gap-3">
          <Label>Filter by event:</Label>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {getCategoryIcon(event.category)} {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {events.length === 0 ? (
        <Card className="card-celebration">
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">No events yet</h2>
            <p className="text-muted-foreground mb-6">
              Create an event to start uploading photos
            </p>
            <Link to="/dashboard/events/new">
              <Button className="btn-coral gap-2">
                <Plus className="w-5 h-5" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : displayPhotos.length === 0 ? (
        <Card className="card-celebration">
          <CardContent className="py-16 text-center">
            <Image className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">No photos yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload photos to preserve your event memories
            </p>
            <Button className="btn-coral gap-2" onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="w-5 h-5" />
              Upload Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayPhotos.map((photo) => {
            const event = events.find(e => e.id === photo.eventId);
            
            return (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted"
                onClick={() => setViewingPhoto(photo)}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || 'Event photo'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {photo.caption && (
                      <p className="text-cream text-sm line-clamp-2 mb-1">
                        {photo.caption}
                      </p>
                    )}
                    {event && selectedEventId === 'all' && (
                      <p className="text-cream/70 text-xs">
                        {getCategoryIcon(event.category)} {event.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event">Select Event *</Label>
              <Select value={uploadEventId} onValueChange={setUploadEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {getCategoryIcon(event.category)} {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="photo">Photo *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              {uploadPreview ? (
                <div className="relative mt-2">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setUploadPreview('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mt-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-muted-foreground">Click to select a photo</span>
                  <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                </label>
              )}
            </div>

            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Add a caption..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="btn-coral flex-1" onClick={handleUpload}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {viewingPhoto && (
            <div>
              <img
                src={viewingPhoto.imageUrl}
                alt={viewingPhoto.caption || 'Event photo'}
                className="w-full max-h-[70vh] object-contain bg-foreground"
              />
              <div className="p-4 space-y-3">
                {viewingPhoto.caption && (
                  <p className="text-lg">{viewingPhoto.caption}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Uploaded {format(new Date(viewingPhoto.uploadedAt), 'MMM d, yyyy')}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => handleDownload(viewingPhoto)}>
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => handleShare(viewingPhoto)}>
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="gap-2 ml-auto"
                    onClick={() => handleDeletePhoto(viewingPhoto.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

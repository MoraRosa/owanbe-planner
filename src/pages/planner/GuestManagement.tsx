import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  initDB, 
  getUserEvents, 
  getEventGuests,
  createGuest,
  updateGuest,
  deleteGuest
} from '@/lib/indexedDb';
import type { PlannerEvent, Guest } from '@/types/planner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import BulkGuestImport from '@/components/BulkGuestImport';
import { 
  Plus, Trash2, Users, UserCheck, UserX, Clock, 
  Copy, Share2, Mail, Phone, Edit2, Search
} from 'lucide-react';

const RSVP_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
  attending: { label: 'Attending', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: UserCheck },
  not_attending: { label: 'Not Attending', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: UserX },
  maybe: { label: 'Maybe', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Users },
};

export default function GuestManagement() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestPlusOnes, setGuestPlusOnes] = useState('0');
  const [guestDietary, setGuestDietary] = useState('');
  const [guestTable, setGuestTable] = useState('');

  useEffect(() => {
    if (!user) return;
    loadEvents();
  }, [user]);

  useEffect(() => {
    if (selectedEventId) {
      loadGuests();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      await initDB();
      const userEvents = await getUserEvents(user!.id);
      setEvents(userEvents);
      if (userEvents.length > 0) {
        setSelectedEventId(userEvents[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const loadGuests = async () => {
    try {
      const eventGuests = await getEventGuests(selectedEventId);
      setGuests(eventGuests);
    } catch (error) {
      console.error('Error loading guests:', error);
    }
  };

  const resetForm = () => {
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setGuestPlusOnes('0');
    setGuestDietary('');
    setGuestTable('');
    setEditingGuest(null);
  };

  const handleAddGuest = async () => {
    if (!guestName.trim()) {
      toast({ title: 'Please enter a guest name', variant: 'destructive' });
      return;
    }

    try {
      await createGuest({
        eventId: selectedEventId,
        name: guestName.trim(),
        email: guestEmail.trim() || undefined,
        phone: guestPhone.trim() || undefined,
        rsvpStatus: 'pending',
        plusOnes: parseInt(guestPlusOnes) || 0,
        dietaryNotes: guestDietary.trim() || undefined,
        tableNumber: guestTable ? parseInt(guestTable) : undefined,
      });
      await loadGuests();
      resetForm();
      setAddDialogOpen(false);
      toast({ title: 'Guest added successfully!' });
    } catch (error) {
      toast({ title: 'Error adding guest', variant: 'destructive' });
    }
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest || !guestName.trim()) return;

    try {
      await updateGuest({
        ...editingGuest,
        name: guestName.trim(),
        email: guestEmail.trim() || undefined,
        phone: guestPhone.trim() || undefined,
        plusOnes: parseInt(guestPlusOnes) || 0,
        dietaryNotes: guestDietary.trim() || undefined,
        tableNumber: guestTable ? parseInt(guestTable) : undefined,
      });
      await loadGuests();
      resetForm();
      toast({ title: 'Guest updated!' });
    } catch (error) {
      toast({ title: 'Error updating guest', variant: 'destructive' });
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      await deleteGuest(guestId);
      await loadGuests();
      toast({ title: 'Guest removed' });
    } catch (error) {
      toast({ title: 'Error removing guest', variant: 'destructive' });
    }
  };

  const handleRsvpChange = async (guest: Guest, status: Guest['rsvpStatus']) => {
    try {
      await updateGuest({
        ...guest,
        rsvpStatus: status,
        rsvpAt: new Date().toISOString(),
      });
      await loadGuests();
      toast({ title: `RSVP updated to ${RSVP_STATUS_CONFIG[status].label}` });
    } catch (error) {
      toast({ title: 'Error updating RSVP', variant: 'destructive' });
    }
  };

  const openEditDialog = (guest: Guest) => {
    setEditingGuest(guest);
    setGuestName(guest.name);
    setGuestEmail(guest.email || '');
    setGuestPhone(guest.phone || '');
    setGuestPlusOnes(guest.plusOnes.toString());
    setGuestDietary(guest.dietaryNotes || '');
    setGuestTable(guest.tableNumber?.toString() || '');
  };

  const generateShareableLink = () => {
    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (!selectedEvent) return '';
    // In a real app, this would be a unique link to an RSVP form
    return `${window.location.origin}/rsvp/${selectedEventId}`;
  };

  const copyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied to clipboard!' });
  };

  // Filter and search guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || guest.rsvpStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    notAttending: guests.filter(g => g.rsvpStatus === 'not_attending').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    maybe: guests.filter(g => g.rsvpStatus === 'maybe').length,
    totalHeadcount: guests
      .filter(g => g.rsvpStatus === 'attending')
      .reduce((sum, g) => sum + 1 + g.plusOnes, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display text-foreground mb-2">No Events Yet</h2>
        <p className="text-muted-foreground mb-6">Create an event first to manage guests.</p>
        <Button asChild>
          <a href="/dashboard/events/new">Create Your First Event</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Guest Management</h1>
          <p className="text-muted-foreground">Track RSVPs and manage your guest list</p>
        </div>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map(event => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Guests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{stats.attending}</p>
              <p className="text-sm text-muted-foreground">Attending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <UserX className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-foreground">{stats.notAttending}</p>
              <p className="text-sm text-muted-foreground">Declined</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
              <p className="text-2xl font-bold text-foreground">{stats.totalHeadcount}</p>
              <p className="text-sm text-muted-foreground">Total Headcount</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Guests</SelectItem>
            <SelectItem value="attending">Attending</SelectItem>
            <SelectItem value="not_attending">Not Attending</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="maybe">Maybe</SelectItem>
          </SelectContent>
        </Select>
        
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" /> Share RSVP Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share RSVP Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Share this link with your guests so they can RSVP to your event.
              </p>
              <div className="flex gap-2">
                <Input 
                  value={generateShareableLink()} 
                  readOnly 
                  className="bg-muted"
                />
                <Button onClick={copyShareableLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Guests can RSVP directly through this link.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <BulkGuestImport eventId={selectedEventId} onImportComplete={loadGuests} />

        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="guestName">Name *</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Guest name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestEmail">Email</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="guestPhone">Phone</Label>
                  <Input
                    id="guestPhone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestPlusOnes">Plus Ones</Label>
                  <Input
                    id="guestPlusOnes"
                    type="number"
                    min="0"
                    value={guestPlusOnes}
                    onChange={(e) => setGuestPlusOnes(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guestTable">Table Number</Label>
                  <Input
                    id="guestTable"
                    type="number"
                    min="1"
                    value={guestTable}
                    onChange={(e) => setGuestTable(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="guestDietary">Dietary Notes</Label>
                <Textarea
                  id="guestDietary"
                  value={guestDietary}
                  onChange={(e) => setGuestDietary(e.target.value)}
                  placeholder="Any dietary restrictions or preferences"
                  rows={2}
                />
              </div>
              <Button onClick={handleAddGuest} className="w-full">
                Add Guest
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Guest Dialog */}
      <Dialog open={!!editingGuest} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="editGuestName">Name *</Label>
              <Input
                id="editGuestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Guest name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGuestEmail">Email</Label>
                <Input
                  id="editGuestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="editGuestPhone">Phone</Label>
                <Input
                  id="editGuestPhone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGuestPlusOnes">Plus Ones</Label>
                <Input
                  id="editGuestPlusOnes"
                  type="number"
                  min="0"
                  value={guestPlusOnes}
                  onChange={(e) => setGuestPlusOnes(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editGuestTable">Table Number</Label>
                <Input
                  id="editGuestTable"
                  type="number"
                  min="1"
                  value={guestTable}
                  onChange={(e) => setGuestTable(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editGuestDietary">Dietary Notes</Label>
              <Textarea
                id="editGuestDietary"
                value={guestDietary}
                onChange={(e) => setGuestDietary(e.target.value)}
                placeholder="Any dietary restrictions or preferences"
                rows={2}
              />
            </div>
            <Button onClick={handleUpdateGuest} className="w-full">
              Update Guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Guest List ({filteredGuests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>{guests.length === 0 ? 'No guests added yet' : 'No guests match your search'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map(guest => {
                const statusConfig = RSVP_STATUS_CONFIG[guest.rsvpStatus];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div 
                    key={guest.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {guest.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {guest.name}
                          {guest.plusOnes > 0 && (
                            <span className="text-muted-foreground ml-2">+{guest.plusOnes}</span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {guest.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {guest.email}
                            </span>
                          )}
                          {guest.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {guest.phone}
                            </span>
                          )}
                          {guest.tableNumber && (
                            <span>Table {guest.tableNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Select 
                        value={guest.rsvpStatus} 
                        onValueChange={(value: Guest['rsvpStatus']) => handleRsvpChange(guest, value)}
                      >
                        <SelectTrigger className={`w-[140px] ${statusConfig.color}`}>
                          <StatusIcon className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="attending">Attending</SelectItem>
                          <SelectItem value="not_attending">Not Attending</SelectItem>
                          <SelectItem value="maybe">Maybe</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(guest)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteGuest(guest.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

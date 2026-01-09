import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { VENDOR_CATEGORIES } from '@/types/planner';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'starting';
  duration: string;
  active: boolean;
}

export default function VendorServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'hourly' | 'starting'>('fixed');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    // Load services from localStorage (in real app, from database)
    const saved = localStorage.getItem(`owambe_services_${user?.id}`);
    if (saved) {
      setServices(JSON.parse(saved));
    } else {
      // Demo services
      setServices([
        {
          id: '1',
          name: 'Full Event Coverage',
          description: 'Complete photography or videography coverage for your entire event',
          category: 'photography',
          price: 2500,
          priceType: 'fixed',
          duration: '8 hours',
          active: true,
        },
        {
          id: '2',
          name: 'Half Day Package',
          description: 'Perfect for intimate ceremonies or smaller gatherings',
          category: 'photography',
          price: 1500,
          priceType: 'fixed',
          duration: '4 hours',
          active: true,
        },
      ]);
    }
  }, [user]);

  const saveServices = (newServices: Service[]) => {
    setServices(newServices);
    localStorage.setItem(`owambe_services_${user?.id}`, JSON.stringify(newServices));
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDescription(service.description);
      setCategory(service.category);
      setPrice(service.price.toString());
      setPriceType(service.priceType);
      setDuration(service.duration);
    } else {
      setEditingService(null);
      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setPriceType('fixed');
      setDuration('');
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !category || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const serviceData: Service = {
      id: editingService?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      priceType,
      duration: duration.trim(),
      active: editingService?.active ?? true,
    };

    if (editingService) {
      saveServices(services.map(s => s.id === editingService.id ? serviceData : s));
      toast.success('Service updated!');
    } else {
      saveServices([...services, serviceData]);
      toast.success('Service added!');
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    saveServices(services.filter(s => s.id !== id));
    toast.success('Service removed');
  };

  const handleToggleActive = (id: string) => {
    saveServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const getCategoryLabel = (value: string) => {
    return VENDOR_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getCategoryIcon = (value: string) => {
    return VENDOR_CATEGORIES.find(c => c.value === value)?.icon || '✨';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">Manage your service offerings and pricing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="btn-teal gap-2">
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                Define your service details and pricing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Full Event Photography"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's included..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Price (CAD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-7"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Price Type</Label>
                  <Select value={priceType} onValueChange={(v) => setPriceType(v as typeof priceType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="hourly">Per Hour</SelectItem>
                      <SelectItem value="starting">Starting At</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 4 hours, Full day"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="btn-teal">
                  {editingService ? 'Update' : 'Add Service'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No services yet</h3>
            <p className="text-muted-foreground mb-4">Add your first service to start attracting clients</p>
            <Button onClick={() => handleOpenDialog()} className="btn-teal gap-2">
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map(service => (
            <Card key={service.id} className={!service.active ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal/20 to-gold/20 flex items-center justify-center text-2xl shrink-0">
                    {getCategoryIcon(service.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {getCategoryLabel(service.category)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(service.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-muted-foreground mt-2">{service.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="w-4 h-4 text-gold" />
                        <span className="font-semibold">
                          ${service.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {service.priceType === 'hourly' && '/hr'}
                          {service.priceType === 'starting' && '+'}
                        </span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(service.id)}
                        className={service.active ? 'text-teal' : 'text-muted-foreground'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {service.active ? 'Active' : 'Inactive'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

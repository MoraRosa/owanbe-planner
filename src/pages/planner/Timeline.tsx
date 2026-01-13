import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Calendar, Check, Circle, Clock, Flag, Trash2, Edit2, 
  ChevronDown, ChevronRight, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { getUserEvents, initDB, saveMilestone, getMilestones, updateMilestone, deleteMilestone } from '@/lib/indexedDb';
import type { PlannerEvent } from '@/types/planner';
import type { Milestone, MilestoneCategory } from '@/types/timeline';
import { MILESTONE_CATEGORIES, getMilestoneCategoryIcon } from '@/types/timeline';
import { format, isPast, differenceInDays, isToday } from 'date-fns';
import { toast } from 'sonner';

export default function Timeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: 'other' as MilestoneCategory,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const loadData = async () => {
    if (!user) return;
    await initDB();
    
    const userEvents = await getUserEvents(user.id);
    userEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(userEvents);
    
    // Load milestones for each event
    const milestonesMap: Record<string, Milestone[]> = {};
    for (const event of userEvents) {
      const eventMilestones = await getMilestones(event.id);
      milestonesMap[event.id] = eventMilestones.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    }
    setMilestones(milestonesMap);
    
    // Expand first upcoming event by default
    const upcomingEvent = userEvents.find(e => !isPast(new Date(e.date)));
    if (upcomingEvent) {
      setExpandedEvents(new Set([upcomingEvent.id]));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const toggleEventExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleAddMilestone = (eventId: string) => {
    setSelectedEventId(eventId);
    setEditingMilestone(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      category: 'other',
      priority: 'medium',
    });
    setIsDialogOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedEventId(milestone.eventId);
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      dueDate: milestone.dueDate.split('T')[0],
      category: milestone.category,
      priority: milestone.priority,
    });
    setIsDialogOpen(true);
  };

  const handleSaveMilestone = async () => {
    if (!formData.title || !formData.dueDate || !selectedEventId) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingMilestone) {
        await updateMilestone(editingMilestone.id, {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          category: formData.category,
          priority: formData.priority,
        });
        toast.success('Milestone updated');
      } else {
        await saveMilestone({
          eventId: selectedEventId,
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          category: formData.category,
          priority: formData.priority,
          completed: false,
        });
        toast.success('Milestone added');
      }
      setIsDialogOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save milestone');
    }
  };

  const handleToggleComplete = async (milestone: Milestone) => {
    try {
      await updateMilestone(milestone.id, {
        completed: !milestone.completed,
        completedAt: !milestone.completed ? new Date().toISOString() : undefined,
      });
      loadData();
      toast.success(milestone.completed ? 'Marked as incomplete' : 'Marked as complete!');
    } catch {
      toast.error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return;
    try {
      await deleteMilestone(milestoneId);
      toast.success('Milestone deleted');
      loadData();
    } catch {
      toast.error('Failed to delete milestone');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-coral';
      case 'medium': return 'text-gold';
      case 'low': return 'text-teal';
      default: return 'text-muted-foreground';
    }
  };

  const getDueDateStatus = (dueDate: string, completed: boolean) => {
    if (completed) return 'completed';
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (differenceInDays(date, new Date()) <= 3) return 'soon';
    return 'normal';
  };

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
          <h1 className="text-3xl font-display font-bold">Timeline & Milestones</h1>
          <p className="text-muted-foreground mt-1">
            Track your event planning progress with checklists
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="card-celebration">
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">No events yet</h2>
            <p className="text-muted-foreground mb-6">
              Create an event to start adding milestones
            </p>
            <Link to="/dashboard/events/new">
              <Button className="btn-coral gap-2">
                <Plus className="w-5 h-5" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const eventMilestones = milestones[event.id] || [];
            const completedCount = eventMilestones.filter(m => m.completed).length;
            const isExpanded = expandedEvents.has(event.id);
            const overdueMilestones = eventMilestones.filter(
              m => !m.completed && isPast(new Date(m.dueDate)) && !isToday(new Date(m.dueDate))
            );

            return (
              <Card key={event.id} className="card-celebration">
                <Collapsible open={isExpanded} onOpenChange={() => toggleEventExpanded(event.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <CardTitle className="text-lg font-display flex items-center gap-2">
                              {event.title}
                              {overdueMilestones.length > 0 && (
                                <span className="flex items-center gap-1 text-coral text-sm font-normal">
                                  <AlertCircle className="w-4 h-4" />
                                  {overdueMilestones.length} overdue
                                </span>
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.date), 'MMM d, yyyy')} • {completedCount}/{eventMilestones.length} completed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {eventMilestones.length > 0 && (
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-teal transition-all"
                                style={{ width: `${(completedCount / eventMilestones.length) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {eventMilestones.length === 0 ? (
                          <p className="text-muted-foreground text-sm py-4 text-center">
                            No milestones yet. Add your first task!
                          </p>
                        ) : (
                          eventMilestones.map((milestone) => {
                            const status = getDueDateStatus(milestone.dueDate, milestone.completed);
                            
                            return (
                              <div
                                key={milestone.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border ${
                                  milestone.completed 
                                    ? 'bg-muted/30 border-border/50' 
                                    : status === 'overdue'
                                    ? 'bg-coral/5 border-coral/30'
                                    : 'bg-card border-border'
                                }`}
                              >
                                <Checkbox
                                  checked={milestone.completed}
                                  onCheckedChange={() => handleToggleComplete(milestone)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span>{getMilestoneCategoryIcon(milestone.category)}</span>
                                    <span className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {milestone.title}
                                    </span>
                                    <Flag className={`w-4 h-4 ${getPriorityColor(milestone.priority)}`} />
                                  </div>
                                  {milestone.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {milestone.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 text-xs">
                                    <Clock className={`w-3 h-3 ${
                                      status === 'overdue' ? 'text-coral' :
                                      status === 'today' ? 'text-gold' :
                                      status === 'soon' ? 'text-purple' :
                                      'text-muted-foreground'
                                    }`} />
                                    <span className={
                                      status === 'overdue' ? 'text-coral font-medium' :
                                      status === 'today' ? 'text-gold font-medium' :
                                      status === 'soon' ? 'text-purple' :
                                      'text-muted-foreground'
                                    }>
                                      {status === 'overdue' && 'Overdue: '}
                                      {status === 'today' && 'Due Today'}
                                      {status !== 'today' && format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                                    </span>
                                    {milestone.completed && milestone.completedAt && (
                                      <span className="text-teal flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Completed {format(new Date(milestone.completedAt), 'MMM d')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditMilestone(milestone)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteMilestone(milestone.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full mt-4 gap-2"
                        onClick={() => handleAddMilestone(event.id)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Milestone
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Milestone Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Book the venue"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as MilestoneCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MILESTONE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="btn-coral flex-1" onClick={handleSaveMilestone}>
                {editingMilestone ? 'Update' : 'Add'} Milestone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

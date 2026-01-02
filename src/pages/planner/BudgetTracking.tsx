import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  initDB, 
  getUserEvents, 
  getEventBudgetCategories, 
  getEventTransactions,
  createBudgetCategory,
  createTransaction,
  deleteBudgetCategory,
  deleteTransaction,
  updateBudgetCategory
} from '@/lib/indexedDb';
import type { PlannerEvent, BudgetCategory, Transaction } from '@/types/planner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, DollarSign, TrendingUp, PieChart as PieChartIcon, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CATEGORY_COLORS = [
  '#9b5de5', // royal purple
  '#f15bb5', // warm coral
  '#00bbf9', // teal
  '#fee440', // gold
  '#00f5d4', // mint
  '#ff6b6b', // salmon
  '#4ecdc4', // aqua
  '#45b7d1', // sky
  '#96ceb4', // sage
  '#ffeaa7', // cream
];

const DEFAULT_CATEGORIES = [
  { name: 'Venue', color: CATEGORY_COLORS[0] },
  { name: 'Catering', color: CATEGORY_COLORS[1] },
  { name: 'Photography', color: CATEGORY_COLORS[2] },
  { name: 'Decoration', color: CATEGORY_COLORS[3] },
  { name: 'Entertainment', color: CATEGORY_COLORS[4] },
  { name: 'Fashion/Attire', color: CATEGORY_COLORS[5] },
  { name: 'Transportation', color: CATEGORY_COLORS[6] },
  { name: 'Miscellaneous', color: CATEGORY_COLORS[7] },
];

export default function BudgetTracking() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  useEffect(() => {
    if (!user) return;
    loadEvents();
  }, [user]);

  useEffect(() => {
    if (selectedEventId) {
      loadBudgetData();
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

  const loadBudgetData = async () => {
    try {
      const [cats, trans] = await Promise.all([
        getEventBudgetCategories(selectedEventId),
        getEventTransactions(selectedEventId)
      ]);
      setCategories(cats);
      setTransactions(trans);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryAmount) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    try {
      const colorIndex = categories.length % CATEGORY_COLORS.length;
      await createBudgetCategory({
        eventId: selectedEventId,
        name: newCategoryName.trim(),
        allocatedAmount: parseFloat(newCategoryAmount),
        spentAmount: 0,
        color: CATEGORY_COLORS[colorIndex],
      });
      await loadBudgetData();
      setNewCategoryName('');
      setNewCategoryAmount('');
      setCategoryDialogOpen(false);
      toast({ title: 'Category added successfully!' });
    } catch (error) {
      toast({ title: 'Error adding category', variant: 'destructive' });
    }
  };

  const handleAddExpense = async () => {
    if (!newExpenseCategory || !newExpenseDescription.trim() || !newExpenseAmount) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    try {
      const amount = parseFloat(newExpenseAmount);
      await createTransaction({
        eventId: selectedEventId,
        budgetCategoryId: newExpenseCategory,
        description: newExpenseDescription.trim(),
        amount,
        type: 'expense',
        date: new Date().toISOString(),
      });

      // Update category spent amount
      const category = categories.find(c => c.id === newExpenseCategory);
      if (category) {
        await updateBudgetCategory({
          ...category,
          spentAmount: category.spentAmount + amount,
        });
      }

      await loadBudgetData();
      setNewExpenseCategory('');
      setNewExpenseDescription('');
      setNewExpenseAmount('');
      setExpenseDialogOpen(false);
      toast({ title: 'Expense recorded!' });
    } catch (error) {
      toast({ title: 'Error recording expense', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteBudgetCategory(categoryId);
      await loadBudgetData();
      toast({ title: 'Category deleted' });
    } catch (error) {
      toast({ title: 'Error deleting category', variant: 'destructive' });
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      await deleteTransaction(transaction.id);
      
      // Update category spent amount
      const category = categories.find(c => c.id === transaction.budgetCategoryId);
      if (category) {
        await updateBudgetCategory({
          ...category,
          spentAmount: Math.max(0, category.spentAmount - transaction.amount),
        });
      }
      
      await loadBudgetData();
      toast({ title: 'Transaction deleted' });
    } catch (error) {
      toast({ title: 'Error deleting transaction', variant: 'destructive' });
    }
  };

  const setupDefaultCategories = async () => {
    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (!selectedEvent) return;

    const budgetPerCategory = selectedEvent.totalBudget / DEFAULT_CATEGORIES.length;
    
    for (const cat of DEFAULT_CATEGORIES) {
      await createBudgetCategory({
        eventId: selectedEventId,
        name: cat.name,
        allocatedAmount: Math.round(budgetPerCategory),
        spentAmount: 0,
        color: cat.color,
      });
    }
    await loadBudgetData();
    toast({ title: 'Default categories created!' });
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spentAmount, 0);
  const remaining = (selectedEvent?.totalBudget || 0) - totalSpent;
  const unallocated = (selectedEvent?.totalBudget || 0) - totalAllocated;

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: cat.spentAmount,
    color: cat.color,
  })).filter(d => d.value > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
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
        <PieChartIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display text-foreground mb-2">No Events Yet</h2>
        <p className="text-muted-foreground mb-6">Create an event first to start tracking your budget.</p>
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
          <h1 className="text-3xl font-display text-foreground">Budget Tracking</h1>
          <p className="text-muted-foreground">Manage your event expenses</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(selectedEvent?.totalBudget || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Receipt className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(remaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <PieChartIcon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unallocated</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(unallocated)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categories & Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Budget Categories</CardTitle>
            <div className="flex gap-2">
              {categories.length === 0 && (
                <Button variant="outline" size="sm" onClick={setupDefaultCategories}>
                  Use Defaults
                </Button>
              )}
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Budget Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Venue, Catering"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryAmount">Allocated Amount (CAD)</Label>
                      <Input
                        id="categoryAmount"
                        type="number"
                        value={newCategoryAmount}
                        onChange={(e) => setNewCategoryAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <Button onClick={handleAddCategory} className="w-full">
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No categories yet. Add some or use defaults.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map(category => {
                  const percentage = category.allocatedAmount > 0 
                    ? (category.spentAmount / category.allocatedAmount) * 100 
                    : 0;
                  const isOverBudget = percentage > 100;
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-foreground">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {formatCurrency(category.spentAmount)} / {formatCurrency(category.allocatedAmount)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PieChartIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No expenses recorded yet</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Transactions</CardTitle>
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={categories.length === 0}>
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="expenseCategory">Category</Label>
                  <Select value={newExpenseCategory} onValueChange={setNewExpenseCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expenseDescription">Description</Label>
                  <Input
                    id="expenseDescription"
                    value={newExpenseDescription}
                    onChange={(e) => setNewExpenseDescription(e.target.value)}
                    placeholder="e.g., Venue deposit"
                  />
                </div>
                <div>
                  <Label htmlFor="expenseAmount">Amount (CAD)</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  Record Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No transactions yet. Start recording expenses!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map(transaction => {
                const category = categories.find(c => c.id === transaction.budgetCategoryId);
                return (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-8 rounded-full" 
                        style={{ backgroundColor: category?.color || '#888' }}
                      />
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{category?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        -{formatCurrency(transaction.amount)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteTransaction(transaction)}
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

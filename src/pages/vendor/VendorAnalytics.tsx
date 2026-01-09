import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  DollarSign,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const viewsData = [
  { month: 'Jul', views: 120 },
  { month: 'Aug', views: 180 },
  { month: 'Sep', views: 220 },
  { month: 'Oct', views: 280 },
  { month: 'Nov', views: 350 },
  { month: 'Dec', views: 420 },
  { month: 'Jan', views: 380 },
];

const inquiriesData = [
  { month: 'Jul', inquiries: 8 },
  { month: 'Aug', inquiries: 12 },
  { month: 'Sep', inquiries: 15 },
  { month: 'Oct', inquiries: 18 },
  { month: 'Nov', inquiries: 22 },
  { month: 'Dec', inquiries: 28 },
  { month: 'Jan', inquiries: 24 },
];

const revenueData = [
  { month: 'Jul', revenue: 2500 },
  { month: 'Aug', revenue: 3200 },
  { month: 'Sep', revenue: 4100 },
  { month: 'Oct', revenue: 5500 },
  { month: 'Nov', revenue: 6800 },
  { month: 'Dec', revenue: 8200 },
  { month: 'Jan', revenue: 7500 },
];

const eventTypesData = [
  { name: 'Wedding', value: 45, color: 'hsl(var(--purple))' },
  { name: 'Birthday', value: 25, color: 'hsl(var(--coral))' },
  { name: 'Naming', value: 15, color: 'hsl(var(--teal))' },
  { name: 'Other', value: 15, color: 'hsl(var(--gold))' },
];

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconBg 
}: { 
  title: string; 
  value: string; 
  change: number; 
  icon: React.ComponentType<{ className?: string }>; 
  iconBg: string;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className={`flex items-center gap-1 text-sm mt-1 ${change >= 0 ? 'text-teal' : 'text-destructive'}`}>
            {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}% vs last month
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function VendorAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your business performance over time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Profile Views" 
          value="2,450" 
          change={12} 
          icon={Eye} 
          iconBg="bg-teal/10 text-teal"
        />
        <StatCard 
          title="Inquiries" 
          value="127" 
          change={8} 
          icon={MessageSquare} 
          iconBg="bg-coral/10 text-coral"
        />
        <StatCard 
          title="Bookings" 
          value="34" 
          change={15} 
          icon={Calendar} 
          iconBg="bg-purple/10 text-purple"
        />
        <StatCard 
          title="Revenue" 
          value="$37,800" 
          change={-3} 
          icon={DollarSign} 
          iconBg="bg-gold/10 text-gold"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="views">
        <TabsList>
          <TabsTrigger value="views">Profile Views</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Views Over Time</CardTitle>
              <CardDescription>How many planners viewed your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--teal))" 
                      fill="hsl(var(--teal) / 0.2)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inquiries Over Time</CardTitle>
              <CardDescription>Messages from potential clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inquiriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar 
                      dataKey="inquiries" 
                      fill="hsl(var(--coral))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Over Time</CardTitle>
              <CardDescription>Total earnings from bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--gold))" 
                      fill="hsl(var(--gold) / 0.2)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Types Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bookings by Event Type</CardTitle>
            <CardDescription>Distribution of your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {eventTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {eventTypesData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Tips</CardTitle>
            <CardDescription>Ways to improve your visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-teal/5 border border-teal/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Add more portfolio images</p>
                  <p className="text-sm text-muted-foreground">Vendors with 10+ photos get 40% more inquiries</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Respond quickly to inquiries</p>
                  <p className="text-sm text-muted-foreground">Fast responders book 60% more events</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-coral/5 border border-coral/20">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-coral shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Ask for reviews</p>
                  <p className="text-sm text-muted-foreground">Encourage happy clients to leave feedback</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

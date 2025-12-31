import { useNavigate } from 'react-router-dom';
import { Sparkles, User, Store, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, demoLoginPlanner, demoLoginVendor, loading } = useAuth();

  const handlePlannerLogin = async () => {
    await demoLoginPlanner();
    navigate('/dashboard');
  };

  const handleVendorLogin = async () => {
    await demoLoginVendor();
    navigate('/vendor');
  };

  // If already logged in, redirect
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-adire">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple/10 via-coral/10 to-teal/10" />
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-coral flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-foreground" />
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold mb-4">
              <span className="text-gradient-celebration">Owambe</span>
              <span className="block text-foreground">Planner</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Plan your perfect Nigerian celebration. Manage vendors, budgets, and guests 
              all in one place. From weddings to naming ceremonies, we've got you covered!
            </p>

            {/* Features highlight */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['Vendor Discovery', 'Budget Planning', 'Guest RSVPs', 'In-App Messaging'].map((feature) => (
                <span 
                  key={feature}
                  className="px-4 py-2 rounded-full bg-purple/10 text-purple border border-purple/20 text-sm font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Login Options */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="card-celebration border-2 hover:border-coral transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-coral" />
                </div>
                <CardTitle className="text-xl font-display">I'm Planning an Event</CardTitle>
                <CardDescription>
                  Create events, find vendors, manage budgets and guest lists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handlePlannerLogin}
                  disabled={loading}
                  className="w-full btn-coral gap-2"
                >
                  Continue as Planner
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="card-celebration border-2 hover:border-teal transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-teal" />
                </div>
                <CardTitle className="text-xl font-display">I'm a Vendor</CardTitle>
                <CardDescription>
                  Showcase your services and connect with event planners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleVendorLogin}
                  disabled={loading}
                  variant="outline"
                  className="w-full gap-2 border-teal text-teal hover:bg-teal hover:text-cream"
                >
                  Continue as Vendor
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Demo Notice */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            This is a demo prototype. Data is stored locally in your browser.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-purple/5 to-transparent">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Everything you need to plan the <span className="text-gradient-gold">perfect celebration</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Event Management</h3>
              <p className="text-muted-foreground">
                Create and manage multiple events with all details in one place
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-teal/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Budget Tracking</h3>
              <p className="text-muted-foreground">
                Track expenses, upload receipts, and stay within your budget
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Guest RSVPs</h3>
              <p className="text-muted-foreground">
                Send invitations and track responses effortlessly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Owambe Planner — A capstone project prototype</p>
          <p className="mt-1">Built with 💜 for Nigerian celebrations</p>
        </div>
      </footer>
    </div>
  );
}

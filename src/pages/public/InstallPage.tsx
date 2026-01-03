import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Download, Smartphone, Share, Plus, Check, 
  ArrowRight, Wifi, WifiOff, PartyPopper
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-display text-foreground mb-2">App Installed!</h1>
            <p className="text-muted-foreground mb-6">
              Owambe Planner is now installed on your device. Enjoy planning your celebrations!
            </p>
            <Button asChild>
              <Link to="/dashboard">
                Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/20 via-secondary/10 to-background py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl md:text-4xl font-display text-foreground mb-3">
            Install Owambe Planner
          </h1>
          <p className="text-muted-foreground text-lg">
            Add our app to your home screen for quick access and offline features
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Network Status */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${isOnline ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="text-sm">You're online - ready to install</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">You're offline - connect to install</span>
            </>
          )}
        </div>

        {/* Install Button (Android/Desktop) */}
        {deferredPrompt && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-display text-foreground mb-2">Quick Install</h2>
                <p className="text-muted-foreground mb-4">
                  Install Owambe Planner directly to your device
                </p>
                <Button onClick={handleInstallClick} size="lg" className="w-full max-w-xs">
                  <Download className="h-5 w-5 mr-2" />
                  Install Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {isIOS && !deferredPrompt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Install on iPhone/iPad
              </CardTitle>
              <CardDescription>
                Follow these steps to add Owambe Planner to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for the <Share className="h-4 w-4" /> icon at the bottom of Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Scroll down and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for the <Plus className="h-4 w-4" /> icon next to the text
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap "Add" to confirm</p>
                  <p className="text-sm text-muted-foreground">
                    The app will appear on your home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions (fallback if no prompt) */}
        {isAndroid && !deferredPrompt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Install on Android
              </CardTitle>
              <CardDescription>
                Follow these steps to add Owambe Planner to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap the menu button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the three dots (⋮) in Chrome's top right corner
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap "Install app" or "Add to Home screen"</p>
                  <p className="text-sm text-muted-foreground">
                    You'll see this option in the menu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Confirm the installation</p>
                  <p className="text-sm text-muted-foreground">
                    The app will be added to your home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5" />
              Why Install?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Quick Access</p>
                  <p className="text-sm text-muted-foreground">Launch instantly from your home screen</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Works Offline</p>
                  <p className="text-sm text-muted-foreground">Access your events even without internet</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Full Screen Experience</p>
                  <p className="text-sm text-muted-foreground">No browser bars - feels like a native app</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Faster Loading</p>
                  <p className="text-sm text-muted-foreground">Cached resources load instantly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue without installing */}
        <div className="text-center pt-4">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Continue without installing →
          </Link>
        </div>
      </div>
    </div>
  );
}
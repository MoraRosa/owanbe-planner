import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackgroundPatternsDemo = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <h1 className="text-4xl font-display font-bold mb-2">Background Patterns Demo</h1>
      <p className="text-muted-foreground mb-8">Explore different pattern options for your designs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Adire Pattern (existing) */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border bg-pattern-adire"
          />
          <h3 className="font-display font-semibold">Adire Pattern (Existing)</h3>
          <p className="text-sm text-muted-foreground">Inline SVG checkered pattern inspired by Nigerian textile</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            .bg-pattern-adire
          </code>
        </div>

        {/* 2. Dots Pattern */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--background))',
              backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          <h3 className="font-display font-semibold">Dots Pattern</h3>
          <p className="text-sm text-muted-foreground">Simple radial gradient dots - clean and minimal</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            radial-gradient(circle, color 1px, transparent 1px)
          </code>
        </div>

        {/* 3. Dots Pattern - Dense */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--card))',
              backgroundImage: 'radial-gradient(circle, hsl(var(--coral) / 0.4) 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px'
            }}
          />
          <h3 className="font-display font-semibold">Dense Dots</h3>
          <p className="text-sm text-muted-foreground">Tighter dot spacing for more texture</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            backgroundSize: 12px 12px
          </code>
        </div>

        {/* 4. Diagonal Stripes */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--background))',
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                hsl(var(--primary) / 0.1) 10px,
                hsl(var(--primary) / 0.1) 20px
              )`
            }}
          />
          <h3 className="font-display font-semibold">Diagonal Stripes</h3>
          <p className="text-sm text-muted-foreground">Classic diagonal stripe pattern</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            repeating-linear-gradient(45deg, ...)
          </code>
        </div>

        {/* 5. Diagonal Stripes - Bold */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--card))',
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 5px,
                hsl(var(--gold) / 0.15) 5px,
                hsl(var(--gold) / 0.15) 10px
              )`
            }}
          />
          <h3 className="font-display font-semibold">Bold Stripes</h3>
          <p className="text-sm text-muted-foreground">Thicker stripes with gold accent</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            -45deg direction, tighter spacing
          </code>
        </div>

        {/* 6. Cross Hatch */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--background))',
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 20px, hsl(var(--teal) / 0.1) 20px, hsl(var(--teal) / 0.1) 21px),
                repeating-linear-gradient(90deg, transparent, transparent 20px, hsl(var(--teal) / 0.1) 20px, hsl(var(--teal) / 0.1) 21px)
              `
            }}
          />
          <h3 className="font-display font-semibold">Cross Hatch / Grid</h3>
          <p className="text-sm text-muted-foreground">Overlapping horizontal and vertical lines</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            Two linear-gradients at 0deg + 90deg
          </code>
        </div>

        {/* 7. Gradient Mesh */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, hsl(var(--coral) / 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 90%, hsl(var(--gold) / 0.2) 0%, transparent 50%),
                hsl(var(--background))
              `
            }}
          />
          <h3 className="font-display font-semibold">Gradient Mesh</h3>
          <p className="text-sm text-muted-foreground">Layered radial gradients for soft blobs</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            Multiple radial-gradients layered
          </code>
        </div>

        {/* 8. Gradient Mesh - Vibrant */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              background: `
                radial-gradient(ellipse at 0% 0%, hsl(var(--purple) / 0.4) 0%, transparent 40%),
                radial-gradient(ellipse at 100% 0%, hsl(var(--teal) / 0.4) 0%, transparent 40%),
                radial-gradient(ellipse at 100% 100%, hsl(var(--coral) / 0.4) 0%, transparent 40%),
                radial-gradient(ellipse at 0% 100%, hsl(var(--gold) / 0.4) 0%, transparent 40%),
                hsl(var(--card))
              `
            }}
          />
          <h3 className="font-display font-semibold">Vibrant Mesh</h3>
          <p className="text-sm text-muted-foreground">Four-corner gradient blob effect</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            Radial gradients in each corner
          </code>
        </div>

        {/* 9. SVG Noise/Grain */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border relative overflow-hidden"
            style={{
              backgroundColor: 'hsl(var(--primary))',
            }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-50 mix-blend-overlay pointer-events-none">
              <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
                <feColorMatrix type="saturate" values="0"/>
              </filter>
              <rect width="100%" height="100%" filter="url(#noise)"/>
            </svg>
          </div>
          <h3 className="font-display font-semibold">Noise / Grain Texture</h3>
          <p className="text-sm text-muted-foreground">SVG fractalNoise for organic feel</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            feTurbulence fractalNoise filter
          </code>
        </div>

        {/* 10. Geometric - Hexagons */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--background))',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <h3 className="font-display font-semibold">Hexagon Pattern</h3>
          <p className="text-sm text-muted-foreground">Geometric hexagon grid (Hero Patterns style)</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            SVG data URI pattern
          </code>
        </div>

        {/* 11. Geometric - Topography */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--card))',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.12'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <h3 className="font-display font-semibold">Grid Pattern</h3>
          <p className="text-sm text-muted-foreground">Technical grid/topography look</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            SVG grid pattern
          </code>
        </div>

        {/* 12. Geometric - Waves */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              backgroundColor: 'hsl(var(--background))',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4v2c8.003 0 13.097-1.087 21.18-4 .347-.125.695-.254 1.053-.382L24 .95C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072 4.947 1.858 9.048 3 14.621 3v-2c-5.273 0-9.157-1.066-13.87-2.834l-2.75-1.072C65.888 3.278 60.562 2 50 2c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662A58.115 58.115 0 0 1 18.316 10c-.354.125-.702.249-1.045.369l-1.768.661C5.656 14.653-.35 16 -10.001 16c-.007 0 0 0 0 0v2c10.272 0 15.364-1.222 24.631-4.928.955-.383 1.869-.74 2.75-1.072C27.143 8.142 32.469 8 42.995 8c.013 0 .02 0 0 0L43 8c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072C80.143 18.142 85.469 20 96.001 20c.007 0 0 0 0 0v-2c-10.272 0-15.364-1.222-24.631-4.928-.955-.383-1.869-.74-2.75-1.072C58.857 7.858 53.531 6 43.005 6c-.013 0-.02 0 0 0L43 6c-10.271 0-15.362 1.222-24.629 4.928-.955.383-1.869.74-2.75 1.072-1.484.556-2.896 1.049-4.254 1.488.345-.127.685-.253 1.02-.378l1.768-.661C23.755 8.857 28.873 8 37.001 8c.007 0 0 0 0 0V6c-8.003 0-13.097 1.087-21.18 4-.347.125-.695.254-1.053.382L13 11.05C3.36 7.653-2.647 8 -13.001 8c-.007 0 0 0 0 0v2' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
          />
          <h3 className="font-display font-semibold">Wave Pattern</h3>
          <p className="text-sm text-muted-foreground">Flowing wave lines for organic feel</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            SVG wave path pattern
          </code>
        </div>

        {/* 13. Combined - Dots + Gradient */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border"
            style={{
              background: `
                radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px),
                radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.2) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, hsl(var(--coral) / 0.2) 0%, transparent 50%),
                hsl(var(--background))
              `,
              backgroundSize: '16px 16px, 100% 100%, 100% 100%, 100% 100%'
            }}
          />
          <h3 className="font-display font-semibold">Dots + Gradient Mesh</h3>
          <p className="text-sm text-muted-foreground">Layer patterns for rich textures</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            Combine multiple techniques
          </code>
        </div>

        {/* 14. Ankara-inspired */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border bg-pattern-ankara"
          />
          <h3 className="font-display font-semibold">Ankara Pattern (Existing)</h3>
          <p className="text-sm text-muted-foreground">Circular pattern inspired by African prints</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            .bg-pattern-ankara
          </code>
        </div>

        {/* 15. Subtle Shimmer */}
        <div className="space-y-3">
          <div 
            className="h-48 rounded-xl border border-border overflow-hidden"
            style={{
              background: `linear-gradient(
                110deg,
                hsl(var(--card)) 0%,
                hsl(var(--card)) 40%,
                hsl(var(--primary) / 0.1) 50%,
                hsl(var(--card)) 60%,
                hsl(var(--card)) 100%
              )`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s infinite'
            }}
          />
          <h3 className="font-display font-semibold">Shimmer Effect</h3>
          <p className="text-sm text-muted-foreground">Animated gradient sweep</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
            .animate-shimmer
          </code>
        </div>
      </div>
    </div>
  );
};

export default BackgroundPatternsDemo;

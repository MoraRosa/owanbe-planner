import { Header } from "./Header";
import { Footer } from "./Footer";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-pattern-adire">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

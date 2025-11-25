import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SplitText from '@/components/common/SplitText';
import { AuroraBackground } from '@/components/ui/aurora-background';

const NotFound = () => {
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route");
  }, []);

  return (
    <>
      <AuroraBackground showRadialGradient={true}>
        <div style={{ height: '100vh', position: 'relative', zIndex: 10 }}>
      <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <SplitText
          text="404"
          className="mb-4 text-4xl font-bold"
          delay={40}
          duration={0.5}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          tag="h1"
        />
        <SplitText
          text="Oops! Page not found"
          className="mb-4 text-xl text-muted-foreground"
          delay={60}
          duration={0.5}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          tag="p"
        />
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
    </div>
      </AuroraBackground>
    </>
  );
};

export default NotFound;

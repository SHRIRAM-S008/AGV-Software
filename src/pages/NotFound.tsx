import { useEffect } from "react";
import SplitText from '@/components/common/SplitText';
import { TopMenu } from '@/components/layout/TopMenu';

const NotFound = () => {
  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home', link: '/' },
    { label: 'Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
    { label: 'Warehouse', ariaLabel: 'View warehouse map', link: '/warehouse' },
    { label: 'Analytics', ariaLabel: 'View analytics and statistics', link: '/analytics' },
    { label: 'Fleet Management', ariaLabel: 'Manage AGV fleet', link: '/agv-fleet' },
    { label: 'Job Creation', ariaLabel: 'Create new jobs', link: '/job-creation' },
    { label: 'WMS Management', ariaLabel: 'Warehouse management system', link: '/wms' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route");
  }, []);

  return (
    <TopMenu menuItems={menuItems} socialItems={socialItems}>
      <div style={{ height: '100vh', background: '#f8fafc' }}>
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
    </TopMenu>
  );
};

export default NotFound;

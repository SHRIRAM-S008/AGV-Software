import { Activity } from 'lucide-react';
import { NavigationBar } from '@/components/NavigationBar';

export const TopBar = () => {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary flex-shrink-0" />
        <span className="text-base font-semibold text-foreground">AGV System</span>
      </div>
      <NavigationBar />
    </div>
  );
};
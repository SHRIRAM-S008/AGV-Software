import { ReactNode } from 'react';
import StaggeredMenu from '@/components/common/StaggeredMenu';

interface TopMenuProps {
  children: ReactNode;
  menuItems: Array<{ label: string; ariaLabel: string; link: string }>;
  socialItems: Array<{ label: string; link: string }>;
}

export const TopMenu = ({ children, menuItems, socialItems }: TopMenuProps) => {
  return (
    <div className="relative">
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#000000"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={true}
        colors={['#ffffff', '#f5f5f5', '#e5e5e5']}
        accentColor="#000000"
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={() => console.log('Menu closed')}
        isFixed={true}
      />
      {children}
    </div>
  );
};

import { forwardRef } from 'react';
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ClassResolver =
  | string
  | ((args: { isActive: boolean; isPending: boolean }) => string | undefined | null);

interface NavLinkCompatProps extends Omit<NavLinkProps, 'className'> {
  className?: ClassResolver;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName = 'text-primary font-semibold',
      pendingClassName = 'opacity-60',
      to,
      ...props
    },
    ref
  ) => (
    <RouterNavLink
      ref={ref}
      to={to}
      className={({ isActive, isPending }) => {
        const base =
          typeof className === 'function'
            ? className({ isActive, isPending })
            : className;

        return cn(
          'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
          base,
          isActive && activeClassName,
          isPending && pendingClassName
        );
      }}
      {...props}
    />
  )
);

NavLink.displayName = 'NavLink';

export { NavLink };
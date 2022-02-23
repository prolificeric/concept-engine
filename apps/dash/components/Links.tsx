import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { intercept } from '../lib/events';
import { Space } from '../types/models';

export const NavLink = ({
  children,
  className = '',
  activeClassName = '',
  href = '/',
  ...restProps
}: React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    activeClassName?: string;
  },
  HTMLAnchorElement
>) => {
  const router = useRouter();
  const pathname = typeof location === 'undefined' ? '' : location.pathname;
  const isActive = pathname === href.split(/\?|#/)[0];
  const classNames = [className, isActive ? activeClassName : ''].filter(
    Boolean,
  );

  if (isActive) {
    restProps['aria-current'] = 'page';
  }

  return (
    <a
      {...restProps}
      href={href}
      className={classNames.join(' ')}
      onClick={intercept(() => router.push(href))}
    >
      {children}
    </a>
  );
};

export const SpaceLink = (props: { space: Space }) => {
  const { space } = props;
  return <Link href={`/spaces/${space.id}`}>{space.name}</Link>;
};

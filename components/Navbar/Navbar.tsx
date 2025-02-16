'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PiListBold } from 'react-icons/pi';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { routes } from '@/configs/routes';
import Link from 'next/link';
import { clsx } from 'clsx';
import styles from './Navbar.module.scss';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const pathname = usePathname();

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className={clsx(styles.sideNav)}>
      <PiListBold className={clsx(styles.navIconMobile)} onClick={toggleNav} />
      <Link href="/">
        <Image
          src="/logo-mobile.png"
          width={42}
          height={42}
          alt="Brain Flip Logo"
          className="max-h-9"
          priority
        />
      </Link>
      <IoIosCloseCircleOutline
        className={clsx(styles.closeNavBtn, { hidden: !isNavOpen })}
        onClick={toggleNav}
      />
      <ul
        className={clsx(
          styles.nav,
          isNavOpen ? styles.navOpen : styles.navClosed,
        )}
      >
        {routes.navbar.map(navItem => (
          <li
            className={clsx(
              styles.navItem,
              (pathname === "/" && navItem.path === "/") || 
              (navItem.path !== "/" && pathname.includes(navItem.path))
                ? styles.navItemActive
                : styles.navItemInactive,
            )}
            key={navItem.path}
          >
            <Link href={navItem.path} className={clsx(styles.navLink)}>
              {navItem.name}
            </Link>
          </li>

        ))}
      </ul>
    </div>
  );
};

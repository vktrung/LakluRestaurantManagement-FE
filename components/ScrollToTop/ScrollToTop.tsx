'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ScrollToTop.module.scss';
import { FaArrowUp } from 'react-icons/fa6';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollRate, setScrollRate] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);

    // Ensure the portal element is available after mounting
    setPortalElement(document.getElementById('scroll-to-top-portal'));

    return () => setMounted(false);
  }, []);

  const toggleVisibilityAndScrollRate = () => {
    const scrollTop = window.pageYOffset;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    // Calculate scroll rate as a percentage (0 - 100)
    const rate = (scrollTop / scrollHeight) * 100;
    setScrollRate(rate);

    // Toggle visibility
    setIsVisible(scrollTop > 300);
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibilityAndScrollRate);
    return () =>
      window.removeEventListener('scroll', toggleVisibilityAndScrollRate);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Prevent rendering if not mounted or portal is missing
  if (!mounted || !portalElement) return null;

  return createPortal(
    <button
      onClick={scrollToTop}
      className={styles.scrollToTop}
      style={{ '--scroll-rate': `${scrollRate}%` } as React.CSSProperties}
      aria-label="Scroll to top"
    >
      <FaArrowUp />
    </button>,
    portalElement
  );
};

export default ScrollToTop;

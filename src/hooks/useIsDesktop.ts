import {useEffect, useState} from 'react';

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    const handleResize = () => {
      setIsDesktop(Math.min(window.innerWidth, window.innerHeight) > 769);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return isDesktop;
}

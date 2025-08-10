import { useState } from 'react';

function checkIsDesktop() {
  return Math.min(window.innerWidth, window.innerHeight) > 500;
}

function checkSmallMobile() {
  return Math.min(window.innerWidth, window.innerHeight) < 376;
}

export function useDeviceType() {
  const [isDesktop] = useState(checkIsDesktop());
  const [isSmallMobile] = useState(checkSmallMobile());
  // useEffect(() => {
  //   if (globalThis.window === undefined) {
  //     return;
  //   }

  //   const handleResize = () => {
  //     setIsDesktop(checkIsDesktop());
  //   };

  //   handleResize();
  //   window.addEventListener('resize', handleResize);
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);
  return { isDesktop, isMobile: !isDesktop, isSmallMobile };
}

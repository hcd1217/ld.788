import { useState } from 'react';

function checkIsDesktop() {
  return Math.min(window.innerWidth, window.innerHeight) > 500;
}

export function useIsDesktop() {
  const [isDesktop] = useState(checkIsDesktop());
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
  return isDesktop;
}
export default useIsDesktop;

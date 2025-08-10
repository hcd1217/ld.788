import { useState } from 'react';

function checkIsDesktop() {
  return Math.min(window.innerWidth, window.innerHeight) > 500;
}

function checkSmallMobile() {
  return Math.min(window.innerWidth, window.innerHeight) < 375;
}

export function useDeviceType() {
  const [isDesktop] = useState(checkIsDesktop());
  const [isSmallMobile] = useState(checkSmallMobile());

  return { isDesktop, isMobile: !isDesktop, isSmallMobile };
}

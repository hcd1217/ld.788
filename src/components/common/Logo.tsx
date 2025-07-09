import {LazyImage} from '@/components/lazy/LazyImage';

type LogoProps = {
  readonly size?: number;
  readonly borderRadius?: string;
};

export function Logo({size = 36, borderRadius = '8px'}: LogoProps) {
  return (
    <LazyImage
      src="/logo.svg"
      alt="Credo Logo"
      width={size}
      height={size}
      radius={borderRadius}
      threshold={0.1}
      rootMargin="20px"
      fallback={
        <div
          style={{
            width: size,
            height: size,
            borderRadius,
            backgroundColor: 'var(--mantine-color-gray-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'var(--mantine-color-gray-6)',
          }}
        >
          Logo
        </div>
      }
    />
  );
}

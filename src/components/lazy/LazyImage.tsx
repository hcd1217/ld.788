import {useState, useEffect, useRef} from 'react';
import {Skeleton, Image, type ImageProps} from '@mantine/core';

type LazyImageProps = {
  readonly src: string;
  readonly alt: string;
  readonly placeholder?: string;
  readonly threshold?: number;
  readonly rootMargin?: string;
  readonly fallback?: React.ReactNode;
  readonly onLoad?: () => void;
  readonly onError?: () => void;
  readonly width?: number | string;
  readonly height?: number | string;
} & Omit<ImageProps, 'src' | 'alt' | 'onLoad' | 'onError' | 'width' | 'height'>;

export function LazyImage({
  src,
  alt,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  onLoad,
  onError,
  width,
  height,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const renderFallback = async () => {
    if (fallback) {
      return fallback;
    }

    return (
      <Skeleton
        height={height || 200}
        width={width || '100%'}
        radius={props.radius || 'sm'}
      />
    );
  };

  return (
    <div ref={imgRef} style={{position: 'relative'}}>
      {!isInView && renderFallback()}

      {isInView && !hasError ? (
        <>
          {!isLoaded && renderFallback()}
          <Image
            src={src}
            alt={alt}
            w={width}
            h={height}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </>
      ) : null}

      {hasError ? (
        <div
          style={{
            height: height || 200,
            width: width || '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--mantine-color-gray-1)',
            color: 'var(--mantine-color-gray-6)',
            borderRadius: props.radius || 'var(--mantine-radius-sm)',
          }}
        >
          Failed to load image
        </div>
      ) : null}
    </div>
  );
}

export function useImagePreloader(images: string[]) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const preloadImages = async () => {
      const promises = images.map(async (src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new (globalThis as any).Image();
          img.addEventListener('load', () => {
            resolve(src);
          });
          img.addEventListener('error', reject);
          img.src = src;
        });
      });

      try {
        const loaded = await Promise.allSettled(promises);
        const successful = loaded
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);

        setPreloadedImages(new Set(successful));
      } catch (error) {
        console.warn('Failed to preload some images:', error);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images]);

  return {
    preloadedImages,
    isPreloaded: (src: string) => preloadedImages.has(src),
  };
}

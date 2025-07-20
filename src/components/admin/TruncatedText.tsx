import {useRef, useState, useEffect} from 'react';
import {Text, Tooltip, type TextProps} from '@mantine/core';

interface TruncatedTextProps extends TextProps {
  readonly text: string;
  readonly tooltipLabel?: string;
  readonly maxWidth?: string | number;
}

export function TruncatedText({
  text,
  tooltipLabel,
  maxWidth,
  lineClamp = 2,
  ...textProps
}: TruncatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      const element = textRef.current;
      if (element) {
        // For lineClamp, check if scrollHeight is greater than clientHeight
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setIsTruncated(isOverflowing);
      }
    };

    checkTruncation();
    // Check again after a short delay to ensure styles are applied
    const timer = setTimeout(checkTruncation, 100);

    // Also check on window resize
    window.addEventListener('resize', checkTruncation);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [text, lineClamp]);

  const textElement = (
    <Text
      ref={textRef}
      lineClamp={lineClamp}
      style={{maxWidth, cursor: isTruncated ? 'help' : 'inherit'}}
      {...textProps}
    >
      {text}
    </Text>
  );

  if (isTruncated) {
    return (
      <Tooltip
        multiline
        withArrow
        label={tooltipLabel || text}
        maw={400}
        transitionProps={{duration: 200}}
      >
        {textElement}
      </Tooltip>
    );
  }

  return textElement;
}

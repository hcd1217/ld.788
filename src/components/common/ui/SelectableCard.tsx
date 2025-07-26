import {type ReactNode} from 'react';
import {Card, type CardProps} from '@mantine/core';
import classes from './SelectableCard.module.css';

export interface SelectableCardProps extends Omit<CardProps, 'onClick'> {
  readonly children: ReactNode;
  readonly isSelected?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function SelectableCard({
  children,
  isSelected = false,
  onClick,
  className,
  shadow,
  ...cardProps
}: SelectableCardProps) {
  return (
    <Card
      withBorder
      shadow={shadow ?? (isSelected ? 'xl' : 'sm')}
      padding="lg"
      radius="md"
      className={`${classes.selectableCard} ${isSelected ? classes.selected : ''} ${className ?? ''}`}
      onClick={onClick}
      {...cardProps}
    >
      {children}
    </Card>
  );
}

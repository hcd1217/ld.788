import { Badge, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';

type POTagsProps = {
  readonly tags?: string[];
  readonly size?: 'xs' | 'sm' | 'md';
  readonly justify?: 'start' | 'end' | 'center';
};

export function POTags({ tags, size = 'xs', justify = 'start' }: POTagsProps) {
  const { t } = useTranslation();

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Group gap="xs" justify={justify}>
      {tags.map((tag) => (
        <Badge key={tag} size={size} variant="filled" color="orange">
          {t(`po.tag.${tag}` as any)}
        </Badge>
      ))}
    </Group>
  );
}

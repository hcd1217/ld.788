import { useCallback, useMemo } from 'react';
import English from '@/domain/translation/english.ts';

export default function useTranslation(): (
  key?: string,
  ...args: Array<string | number>
) => string {
  const english = useMemo(() => new English(), []);
  const t = useCallback(
    (key?: string, ..._args: Array<string | number>) => {
      return english.translate(key ?? '', ..._args);
    },
    [english],
  );
  return t;
}

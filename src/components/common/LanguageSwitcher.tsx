import {Select} from '@mantine/core';
import {IconLanguage} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';

const languages = [
  {value: 'en', label: 'English'},
  {value: 'vi', label: 'Tiếng Việt'},
];

export function LanguageSwitcher() {
  const {currentLanguage, changeLanguage} = useTranslation();

  return (
    <Select
      data={languages}
      value={currentLanguage}
      leftSection={<IconLanguage size={18} />}
      size="sm"
      w={140}
      comboboxProps={{
        transitionProps: {
          transition: 'fade',
          duration: 200,
        },
      }}
      onChange={(value) => {
        if (value) {
          changeLanguage(value);
          localStorage.setItem('language', value);
        }
      }}
    />
  );
}

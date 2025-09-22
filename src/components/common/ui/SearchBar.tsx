import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type SearchBarProps = {
  readonly hidden?: boolean;
  readonly searchQuery?: string;
  readonly placeholder?: string;
  readonly maxWidth?: string | number;
  readonly setSearchQuery: (query: string) => void;
};

export function SearchBar({
  maxWidth = 400,
  hidden,
  placeholder,
  searchQuery,
  setSearchQuery,
}: SearchBarProps) {
  if (hidden) {
    return null;
  }

  return (
    <TextInput
      mb="xs"
      placeholder={placeholder}
      leftSection={<IconSearch size={16} />}
      value={searchQuery}
      style={{ flex: 1, maxWidth }}
      onChange={(e) => {
        setSearchQuery(e.target.value);
      }}
    />
  );
}

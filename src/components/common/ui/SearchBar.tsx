import {TextInput} from '@mantine/core';
import {IconSearch} from '@tabler/icons-react';

type SearchBarProps = {
  readonly hidden?: boolean;
  readonly searchQuery?: string;
  readonly placeholder?: string;
  readonly setSearchQuery: (query: string) => void;
};

export function SearchBar({
  hidden,
  placeholder,
  searchQuery,
  setSearchQuery,
}: SearchBarProps) {
  if (hidden) {
    return <div />;
  }

  return (
    <TextInput
      placeholder={placeholder}
      leftSection={<IconSearch size={16} />}
      value={searchQuery}
      style={{flex: 1, maxWidth: 400}}
      onChange={(e) => {
        setSearchQuery(e.target.value);
      }}
    />
  );
}

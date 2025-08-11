import { Text, Stack } from '@mantine/core';

type ContactInfoProps = {
  email?: string;
  phoneNumber?: string;
  contactPhone?: string;
  contactEmail?: string;
};
export function ContactInfo(props: ContactInfoProps) {
  const email = props.contactEmail || props.email || '';
  const phoneNumber = props.contactPhone || props.phoneNumber || '';

  if (!email && !phoneNumber) {
    return '-';
  }

  if (email && phoneNumber) {
    return (
      <Stack gap={4}>
        <Text size="sm">{phoneNumber}</Text>
        <Text size="sm" c="dimmed">
          {email}
        </Text>
      </Stack>
    );
  }

  return email || phoneNumber;
}

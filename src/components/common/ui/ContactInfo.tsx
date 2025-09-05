import { Text, Stack } from '@mantine/core';

type ContactInfoProps = {
  email?: string;
  phoneNumber?: string;
  contactPhone?: string;
  contactEmail?: string;
  pic?: string;
};
export function ContactInfo(props: ContactInfoProps) {
  const email = props.contactEmail || props.email || '';
  const phoneNumber = props.contactPhone || props.phoneNumber || '';
  const pic = props.pic || '';

  if (!email && !phoneNumber && !pic) {
    return '-';
  }

  return (
    <Stack gap={4}>
      {Object.entries({ pic, phoneNumber, email }).map(([key, value]) => {
        if (!value) return null;
        return (
          <Text size="sm" key={key}>
            {value}
          </Text>
        );
      })}
    </Stack>
  );
}

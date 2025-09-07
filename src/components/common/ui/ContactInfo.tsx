import { useDeviceType } from '@/hooks/useDeviceType';
import { Text, Stack, Group, Anchor } from '@mantine/core';

type ContactInfoProps = {
  email?: string;
  phoneNumber?: string;
  contactPhone?: string;
  contactEmail?: string;
  pic?: string;
  blank?: string;
  horizontal?: boolean;
};
export function ContactInfo(props: ContactInfoProps) {
  const email = props.contactEmail || props.email || '';
  const phoneNumber = props.contactPhone || props.phoneNumber || '';
  const pic = props.pic || '';
  const { isMobile } = useDeviceType();

  if (!email && !phoneNumber && !pic) {
    return props.blank ?? '-';
  }

  const contact = Object.entries({ pic, phoneNumber, email }).map(([key, value]) => {
    if (!value) return null;
    if (key === 'phoneNumber' && isMobile) {
      return (
        <Anchor
          ml="sm"
          href={`tel:${value}`}
          size="sm"
          fw={600}
          style={{
            fontStyle: 'italic',
          }}
        >
          {value}
        </Anchor>
      );
    }
    return (
      <Text size="sm" key={key}>
        {value}
      </Text>
    );
  });

  if (props.horizontal) {
    return <Group gap={4}>{contact}</Group>;
  }

  return <Stack gap={4}>{contact}</Stack>;
}

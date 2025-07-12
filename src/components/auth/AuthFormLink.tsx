import {Anchor, Center, Text} from '@mantine/core';

type AuthFormLinkProps = {
  readonly text: string;
  readonly linkText: string;
  readonly href: string;
};

export function AuthFormLink({text, linkText, href}: AuthFormLinkProps) {
  return (
    <Center mt="lg">
      <Text size="sm" ta="center" mt="lg" c="dimmed">
        {text}{' '}
        <Anchor href={href} size="sm" fw="600">
          {linkText}
        </Anchor>
      </Text>
    </Center>
  );
}

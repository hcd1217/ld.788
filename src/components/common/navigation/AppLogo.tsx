import { type MantineStyleProps, Group, Title, Box } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useLogoAndTitle } from '@/hooks/useLogoAndTitle';

type AppLogoProps = {
  readonly c?: string;
  readonly fw?: MantineStyleProps['fw'];
  readonly link?: string;
  readonly noTitle?: boolean;
};
export function AppLogo({ noTitle = false, c, fw, link = '/home' }: AppLogoProps) {
  const navigate = useNavigate();
  const { logoUrl, title } = useLogoAndTitle();

  return (
    <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(link)}>
      <Box
        component="img"
        src={logoUrl || '/icons/logo-black-and-white.svg'}
        alt="Logo"
        fw={fw}
        style={{
          width: 30,
          height: 30,
        }}
      />
      {noTitle ? null : (
        <Title order={3} c={c}>
          {title}
        </Title>
      )}
    </Group>
  );
}

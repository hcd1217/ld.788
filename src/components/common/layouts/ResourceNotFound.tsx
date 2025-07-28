import {Container, Stack, Box, Alert, Group} from '@mantine/core';
import {IconAlertCircle} from '@tabler/icons-react';
import {GoBack} from '@/components/common';

type ResourceNotFoundProps = {
  readonly message: string;
  readonly withGoBack?: boolean;
};
export function ResourceNotFound({
  message,
  withGoBack = false,
}: ResourceNotFoundProps) {
  return (
    <Container fluid w="100%" mt="xl">
      <Stack gap="xl">
        {withGoBack ? (
          <Group justify="left">
            <GoBack />
          </Group>
        ) : null}

        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            style={{maxWidth: '600px', width: '100%'}}
          >
            {message}
          </Alert>
        </Box>
      </Stack>
    </Container>
  );
}

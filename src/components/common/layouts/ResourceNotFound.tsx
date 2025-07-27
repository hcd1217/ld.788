import {Container, Stack, Box, Alert, Group} from '@mantine/core';
import {IconAlertCircle} from '@tabler/icons-react';
import {GoBack} from '@/components/common';

type ResourceNotFoundProps = {
  readonly message: string;
};
export function ResourceNotFound({message}: ResourceNotFoundProps) {
  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        <Group justify="left">
          <GoBack />
        </Group>

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

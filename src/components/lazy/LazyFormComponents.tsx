import {lazy, Suspense} from 'react';
import {Skeleton, Stack} from '@mantine/core';

const LazyFormContainer = lazy(async () => {
  const module = await import('@/components/form/FormContainer');
  return {default: module.FormContainer};
});

const LazyFormInput = lazy(async () => {
  const module = await import('@/components/form/FormInput');
  return {default: module.FormInput};
});

const LazyFormButton = lazy(async () => {
  const module = await import('@/components/form/FormButton');
  return {default: module.FormButton};
});

function FormContainerSkeleton() {
  return (
    <Stack gap="xl">
      <Skeleton height={300} radius="md" />
    </Stack>
  );
}

function FormInputSkeleton() {
  return <Skeleton height={40} radius="sm" />;
}

function FormButtonSkeleton() {
  return <Skeleton height={55} radius="sm" />;
}

type LazyFormContainerProps = Parameters<typeof LazyFormContainer>[0];
type LazyFormInputProps = Parameters<typeof LazyFormInput>[0];
type LazyFormButtonProps = Parameters<typeof LazyFormButton>[0];

export function FormContainer(props: LazyFormContainerProps) {
  return (
    <Suspense fallback={<FormContainerSkeleton />}>
      <LazyFormContainer {...props} />
    </Suspense>
  );
}

export function FormInput(props: LazyFormInputProps) {
  return (
    <Suspense fallback={<FormInputSkeleton />}>
      <LazyFormInput {...props} />
    </Suspense>
  );
}

export function FormButton(props: LazyFormButtonProps) {
  return (
    <Suspense fallback={<FormButtonSkeleton />}>
      <LazyFormButton {...props} />
    </Suspense>
  );
}

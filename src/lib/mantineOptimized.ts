// Optimized Mantine imports for tree shaking
// This file centralizes commonly used Mantine components for better bundling

// Core components (most commonly used)
export {
  // Layout
  Container,
  Stack,
  Group,
  Box,
  Center,
  Flex,
  // Typography
  Title,
  Text,
  // Paper & Cards
  Paper,
  Card,
  // Inputs
  TextInput,
  PasswordInput,
  Button,
  // Feedback
  Skeleton,
  Loader,
  // Navigation
  Anchor,
  // Spacing
  Space,
  // Transitions
  Transition,
  // Overlays
  LoadingOverlay,
  // Forms
  Alert,
} from '@mantine/core/';

// Hooks (lightweight, commonly used)
export {
  useDisclosure,
  useClickOutside,
  useResizeObserver,
  useIntersection,
  useIdle,
  useIsomorphicEffect,
} from '@mantine/hooks/';

// Form utilities (auth-specific)
export {useForm, isEmail, hasLength, isNotEmpty, matches} from '@mantine/form/';

// Notifications (small, auth-specific)
export {
  notifications,
  showNotification,
  cleanNotifications,
} from '@mantine/notifications/';

// Modals (less commonly used)
export {modals, openModal, closeModal, closeAllModals} from '@mantine/modals/';

// Re-export commonly used types for better tree shaking
export type {
  MantineTheme,
  MantineColorsTuple,
  MantineSize,
  MantineRadius,
  ButtonProps,
  TextInputProps,
  PasswordInputProps,
  PaperProps,
  StackProps,
  GroupProps,
  TitleProps,
  TextProps,
  AnchorProps,
  AlertProps,
  SkeletonProps,
  LoaderProps,
  TransitionProps,
  LoadingOverlayProps,
  ContainerProps,
  CardProps,
  BoxProps,
  CenterProps,
  FlexProps,
  SpaceProps,
} from '@mantine/core/';

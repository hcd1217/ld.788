/// <reference types="vite/client" />
/// <reference types="@react-google-maps/api" />

type ImportMetaEnv = {
  readonly VITE_API_URL?: string;
  readonly VITE_DEV_API_DELAY?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};

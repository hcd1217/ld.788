/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_API_URL?: string;
  readonly VITE_DEV_API_DELAY?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};

export type Timeout = ReturnType<typeof setTimeout>;

export type PhotoData = {
  id: string;
  publicUrl: string;
  key: string;
  caption?: string;
  timestamp: string;
  uploadedBy: string;
};

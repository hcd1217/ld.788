export type Timeout = ReturnType<typeof setTimeout>;

export type UploadPhoto = {
  publicUrl: string;
  key: string;
  caption?: string;
};

export type PhotoData = {
  id: string;
  publicUrl: string;
  key: string;
  caption?: string;
  timestamp: string;
  uploadedBy: string;
};

export type Address = {
  oneLineAddress?: string;
  googleMapsUrl?: string;
};

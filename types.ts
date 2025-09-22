
export interface UploadedImage {
  file: File;
  base64: string;
}

export interface RestorationResult {
  image: string | null;
  text: string | null;
}

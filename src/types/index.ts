export type Platform = 'tiktok' | 'twitter' | 'youtube' | 'instagram';

export interface MediaInfo {
  downloadUrl: string;
  fileName: string;
  fileType: 'video' | 'image';
  thumbnail?: string;
}
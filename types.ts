export enum AudioSource {
  UPLOAD = 'UPLOAD',
  RECORD = 'RECORD',
}

export interface TranscriptionResult {
  text: string;
  timestamp: Date;
}

export interface AudioState {
  file: File | null;
  blob: Blob | null;
  url: string | null;
}

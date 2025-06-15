export interface DropData {
  type: 'file' | 'text';
  data: string; // Base64 encoded encrypted data
  remainingViews: number;
  createdAt: number;
  filename?: string; // Optional for files
}

export interface UploadRequest {
  type: 'file' | 'text';
  data: string; // Base64 encoded encrypted data
  expiry: number; // TTL in seconds
  maxViews: number;
  filename?: string; // Optional for files
}

export interface UploadResponse {
  id: string;
}

export interface RetrieveResponse {
  type: 'file' | 'text';
  data: string;
  filename?: string;
}

export interface DestroyResponse {
  success: boolean;
} 
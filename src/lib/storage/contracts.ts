import "server-only";

export type StoredObject = {
  bytes: Uint8Array;
  contentType: string | null;
};

export interface PrivateObjectStorage {
  readonly provider: "r2";
  createUploadUrl(objectKey: string, expiresInSeconds: number): Promise<string>;
  createReadUrl(objectKey: string, expiresInSeconds: number): Promise<string>;
  readObject(objectKey: string): Promise<StoredObject>;
  putObject(objectKey: string, bytes: Uint8Array, contentType: string): Promise<void>;
  deleteObject(objectKey: string): Promise<void>;
}

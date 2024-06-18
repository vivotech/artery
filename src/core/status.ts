export interface ArteryStatus {
  installed: boolean | null;
  enabled: boolean | null;
  active: boolean | null;
  port: number | null;

  version: string | null;
  uptime: number | null;
  name: string;
}

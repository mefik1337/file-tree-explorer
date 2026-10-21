export interface TreeRepository {
  load(): string | null;
  save(json: string): boolean;
  clear(): void;
}

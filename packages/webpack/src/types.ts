export interface ModuleInfo {
  code?: string | null,
  deps: Record<string, string>,
  file: string
}

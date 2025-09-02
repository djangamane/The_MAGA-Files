/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CSV_URL: string
  // Add other environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
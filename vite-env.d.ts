// Augment the NodeJS namespace to include API_KEY in process.env
// This avoids shadowing the global process variable which causes issues in vite.config.ts
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

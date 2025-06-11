// Type declarations to resolve server configuration issues
declare module 'vite' {
  interface ServerOptions {
    allowedHosts?: boolean | string[] | true;
  }
}
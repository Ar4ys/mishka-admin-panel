declare global {
  import 'typed-query-selector/strict';
}

declare module 'https://unpkg.com/ky@0.31.1' {
  export * from 'ky';
  export { default } from 'ky';
}

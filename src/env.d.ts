/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

/** Versionsnummer aus package.json (vite.config.ts → define) */
declare const __APP_VERSION__: string

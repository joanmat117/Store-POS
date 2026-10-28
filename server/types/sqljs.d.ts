// Type declarations for sql.js
declare module 'sql.js' {
  export interface Database {
    exec(sql: string): void;
    prepare(sql: string): Statement;
    run(sql: string, params?: unknown[]): void;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
  }

  export interface Statement {
    bind(params: unknown[]): this;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    get(): unknown[];
    free(): void;
  }

  export interface Config {
    locateFile?: (file: string) => string;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }

  export function initSqlJs(config?: Config): Promise<SqlJsStatic>;
}
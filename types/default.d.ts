import { Context } from 'koa';

declare global {
  export type Hitpass = (ctx: Context) => boolean;

  export type ModelCacheParams = {
    [key: string]: string;
  };

  export type ClearCacheFn = (
    cacheConf: ModelCacheConfig,
    params?: { [key: string]: string }
  ) => Promise<void>;
  export type GetCacheConfigByUidFn = (
    uid: string
  ) => ModelCacheConfig | undefined;
  export type GetCacheConfigFn = (
    model: string,
    plugin?: string
  ) => ModelCacheConfig | undefined;
  export type PurgeFn = (cacheConf: ModelCacheConfig) => KoaRouteMiddleware;
  export type PurgeAdminFn = KoaRouteMiddleware;
  export type RecvFn = (cacheConf: ModelCacheConfig) => KoaRouteMiddleware;

  export type CacheMiddlewares = {
    purge: PurgeFn;
    purgeAdmin: PurgeAdminFn;
    recv: RecvFn;
  };

  export type CacheStore = {
    get: (key: string) => Promise<any>;
    peek: (key: string) => Promise<any>;
    set: (key: string, value: any, ttl?: number) => Promise<boolean>;
    del: (key: string) => Promise<void>;
    keys: () => Promise<string[]>;
    reset: () => Promise<void>;
  };
  export type InternalCacheStore = {
    get: (key: string) => Promise<any> | any;
    peek: (key: string) => Promise<any> | any;
    set: (key: string, value: any, ttl?: number) => Promise<boolean> | boolean;
    del: (key: string) => Promise<void> | void;
    keys: () => Promise<string[]> | string[];
    reset: () => Promise<void> | void;
    ready: boolean;
  };

  export type CustomRoute = {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    paramNames?: string[];
  };

  export type KoaRouteMiddleware = (
    ctx: Context,
    next: Function
  ) => Promise<void>;

  export type Logger = {
    info: (...args: any) => void;
    debug: (...args: any) => void;
    warn: (...args: any) => void;
    error: (...args: any) => void;
  };

  export type UserModelCacheConfig = {
    singleType?: boolean;
    hitpass?: Hitpass | boolean;
    injectDefaultRoutes?: boolean;
    headers?: string[];
    model: string;
    maxAge?: number;
    plugin?: string;
    routes?: (CustomRoute | string)[];
  };

  export type ModelCacheConfig = {
    singleType: boolean;
    hitpass: Hitpass | boolean;
    injectDefaultRoutes: boolean;
    headers: string[];
    model: string;
    maxAge: number;
    plugin?: string;
    routes: CustomRoute[];
  };

  export type UserMiddlewareCacheConfig = {
    type?: 'mem' | 'redis';
    enabled?: boolean;
    logs?: boolean;
    populateContext?: boolean;
    populateStrapiMiddleware?: boolean;
    enableEtagSupport?: boolean;
    enableXCacheHeaders?: boolean;
    clearRelatedCache?: boolean;
    withKoaContext?: boolean;
    withStrapiMiddleware?: boolean;
    max?: number;
    maxAge?: number;
    cacheTimeout?: number;
    headers?: string[];
    models?: (UserModelCacheConfig | string)[];
    redisConfig?: any;
  };

  export type MiddlewareCacheConfig = {
    type: 'mem' | 'redis';
    enabled: boolean;
    logs: boolean;
    populateContext: boolean;
    populateStrapiMiddleware: boolean;
    enableEtagSupport: boolean;
    enableXCacheHeaders: boolean;
    clearRelatedCache: boolean;
    withKoaContext: boolean;
    withStrapiMiddleware: boolean;
    max: number;
    maxAge: number;
    cacheTimeout: number;
    headers: string[];
    models: ModelCacheConfig[];
    redisConfig?: any;
  };

  export type MiddlewareCache = {
    store: CacheStore;
    initialize: () => void;
  };
}

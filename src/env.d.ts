/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Env = {
    BREVO_API_KEY: string;
    NOTIFICATION_EMAIL: string;
    BREVO_LIST_ID: string;
};

declare namespace App {
    interface Locals {
        runtime: {
            env: Env;
            cf: import('cloudflare:worker').CfProperties;
            ctx: {
                waitUntil: (promise: Promise<any>) => void;
                passThroughOnException: () => void;
            };
            caches: CacheStorage;
        };
    }
}

declare module 'astro:content' {
    export const z: typeof import('zod').z;
    export function defineCollection<S extends import('astro/dist/content/config').BaseSchema>(config: import('astro/dist/content/config').CollectionConfig<S>): import('astro/dist/content/config').CollectionConfig<S>;
}

declare global {
    interface Window {
        grecaptcha: any;
        gtag: (...args: any[]) => void;
        showToast: (message: string, type?: "success" | "error", duration?: number) => void;
    }

    var grecaptcha: any;
    var gtag: (...args: any[]) => void;
}

export { };


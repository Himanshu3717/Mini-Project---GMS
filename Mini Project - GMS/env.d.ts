declare global {
    namespace NodeJS {
        interface ProcessEnv {
            AUTH_REFRESH_TOKEN_SECRET: string;
            AUTH_REFRESH_TOKEN_EXPIRY: string;
            AUTH_ACCESS_TOKEN_SECRET: string;
            AUTH_ACCESS_TOKEN_EXPIRY: string;
            DATABASE_URL: string;
            BCRYPTJS_SALT: number
        }
    }
}

export { };

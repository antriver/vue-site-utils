export interface TokenStoreInterface {
    getToken(): string | null;

    setToken(token: string | null): void;
}

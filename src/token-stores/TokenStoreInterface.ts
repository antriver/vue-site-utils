export interface TokenStoreInterface {
    getToken(): string | null;

    setToken(token: string): void;
}

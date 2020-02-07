import { TokenStoreInterface } from './TokenStoreInterface';
import { AbstractTokenStore } from './AbstractTokenStore';

export class LocalStorageTokenStore extends AbstractTokenStore implements TokenStoreInterface {
    public getToken(): string | null {
        return window.localStorage.getItem(this.keyName) || null;
    }

    public setToken(token: string): void {
        if (token) {
            window.localStorage.setItem(this.keyName, token);
        } else {
            window.localStorage.removeItem(this.keyName);
        }
    }
}

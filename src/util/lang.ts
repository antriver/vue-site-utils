export function possessive(str: string): string {
    return str + (str.substr(-1) === 's' ? '\'' : '\'s');
}

export function ucfirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function usernameTitle(data: { user: { username: string } }, title: string): string {
    return data && data.user ? possessive(data.user.username) + (title ? ` ${title}` : '') : null;
}

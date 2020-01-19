export function possessive(str) {
    return str + (str.substr(-1) === 's' ? '\'' : '\'s');
}

export function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function usernameTitle(data, title) {
    return data && data.user ? possessive(data.user.username) + (title ? ` ${title}` : '') : null;
}

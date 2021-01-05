import { distanceInWordsStrict, format } from 'date-fns';

export function relativeTime(value: Date|string): string {
    if (!(value instanceof Date)) {
        value = new Date(value);
    }
    return distanceInWordsStrict(
        value,
        new Date(),
    );
}

export function dateTime(value: Date|string): string {
    if (!(value instanceof Date)) {
        value = new Date(value);
    }
    return format(value, 'MMM Do YYYY h:mma');
}

export function date(value: Date|string): string {
    if (!(value instanceof Date)) {
        value = new Date(value);
    }
    return format(value, 'MMM Do YYYY');
}

export function capitalize(value: string): string {
    if (!value) {
        return '';
    }
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function pluralize(text: string, value: number): string {
    return value === 1 ? text : `${text}s`;
}

export function truncate(text: string, length = 30, clamp = '...'): string {
    text = text || '';

    if (text.length <= length) return text;

    let tcText = text.slice(0, length - clamp.length);
    let last = tcText.length - 1;

    while (last > 0 && tcText[last] !== ' ' && tcText[last] !== clamp[0]) last -= 1;

    // Fix for case when text dont have any `space`
    last = last || length - clamp.length;

    tcText = tcText.slice(0, last);

    return tcText + clamp;
}

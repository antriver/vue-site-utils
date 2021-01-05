export function showAlert(text, btnClass, btnText) {
    if (typeof window !== 'undefined') {
        if (window.rootVue) {
            return window.rootVue.$options.$modalFactory.openComponent(
                'AlertModal',
                {
                    text,
                    btnClass,
                    btnText,
                },
            );
        }
        window.alert(text);
        return Promise.resolve();
    }
}

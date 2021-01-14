export function showAlert(text: string, btnClass?: string, btnText?: string): Promise<void> {
    if (typeof window !== 'undefined') {
        if ((window as any).rootVue) {
            return (window as any).rootVue.$options.$modalFactory.openComponent(
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
    return Promise.reject();
}

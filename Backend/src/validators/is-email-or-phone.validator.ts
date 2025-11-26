import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsEmailOrPhone',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (!value || typeof value !== 'string') return false;

                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    const isPhone = /^(0|\+84)(\d{9})$/.test(value);

                    return isEmail || isPhone;
                },
                defaultMessage() {
                    return 'Must be a valid email or Vietnamese phone number';
                },
            },
        });
    };
}

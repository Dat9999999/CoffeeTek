const globalCurrency = 'VND' as Currency;


export type Currency = 'VND' | 'USD';

export interface FormatPriceOptions {
    includeSymbol?: boolean;
}

export const formatPrice = (value: number | undefined | null, options: FormatPriceOptions): string => {
    if (!value && value !== 0) return '';

    const { includeSymbol = true } = options;

    if (globalCurrency === 'VND') {
        // VNĐ: No decimal places, use dot as thousand separator
        const formatted = Math.round(value).toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return includeSymbol ? `${formatted} ₫` : formatted;
    } else {
        // USD: Two decimal places, use comma as thousand separator
        const formatted = value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return includeSymbol ? `$${formatted}` : formatted;
    }
};

export const parsePrice = (value: string | undefined | null): number => {
    if (!value) return 0;

    // Remove globalCurrency symbols and thousand separators
    let cleanValue = value.replace(/[,$₫]/g, '').trim();

    if (globalCurrency === 'VND') {
        // VNĐ: Remove dots and parse as integer
        cleanValue = cleanValue.replace(/\./g, '');
        return parseInt(cleanValue, 10) || 0;
    } else {
        // USD: Remove commas and parse as float
        cleanValue = cleanValue.replace(/,/g, '');
        return parseFloat(cleanValue) || 0;
    }
};

// export const restrictInputToNumbers = (
//     e: React.KeyboardEvent<HTMLInputElement>

// ): void => {
//     // Allow numbers, navigation keys, and decimal point only for USD
//     const allowedKeys = /[0-9]/;
//     const isDecimalAllowed = globalCurrency === 'USD' ? /[0-9.]/.test(e.key) : /[0-9]/.test(e.key);

//     if (
//         !isDecimalAllowed &&
//         e.key !== 'Backspace' &&
//         e.key !== 'Delete' &&
//         e.key !== 'ArrowLeft' &&
//         e.key !== 'ArrowRight' &&
//         e.key !== 'Tab'
//     ) {
//         e.preventDefault();
//     }
// };

export const restrictInputToNumbers = (
    e: React.KeyboardEvent<HTMLInputElement>
): void => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // Cho phép copy, paste, cut, select all, undo, redo
    if (
        ctrlKey &&
        ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())
    ) {
        return; // không block
    }

    const isDecimalAllowed =
        globalCurrency === 'USD'
            ? /[0-9.]/.test(e.key)
            : /[0-9]/.test(e.key);

    if (
        !isDecimalAllowed &&
        e.key !== 'Backspace' &&
        e.key !== 'Delete' &&
        e.key !== 'ArrowLeft' &&
        e.key !== 'ArrowRight' &&
        e.key !== 'Tab'
    ) {
        e.preventDefault();
    }
};

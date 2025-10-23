export const globalCurrency = 'VND' as Currency;


export type Currency = 'VND' | 'USD';


export interface FormatPriceOptions {
    includeSymbol?: boolean;
}

export const getPriceSymbol = () => {
    if (globalCurrency === 'VND') return "₫";
    if (globalCurrency === 'USD') return "$";
    return ""
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

export const formatPriceRange = (
    min: number | undefined | null,
    max: number | undefined | null,
    options: FormatPriceOptions = {}
): string => {
    if ((min === undefined || min === null) && (max === undefined || max === null))
        return '';

    const { includeSymbol = true } = options;

    // Nếu chỉ có 1 giá trị
    if (min != null && max == null) return formatPrice(min, options);
    if (max != null && min == null) return formatPrice(max, options);

    if (globalCurrency === 'VND') {
        const formattedMin = formatPrice(min!, { includeSymbol: false });
        const formattedMax = formatPrice(max!, { includeSymbol: false });
        return includeSymbol
            ? `${formattedMin} - ${formattedMax} ₫`
            : `${formattedMin} - ${formattedMax}`;
    } else {
        // USD: Ký hiệu đứng trước từng số
        if (includeSymbol)
            return `${formatPrice(min!, { includeSymbol: true })} - ${formatPrice(
                max!,
                { includeSymbol: true }
            )}`;
        else
            return `${formatPrice(min!, { includeSymbol: false })} - ${formatPrice(
                max!,
                { includeSymbol: false }
            )}`;
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


export const formatCompactPrice = (
    value: number,
    options: FormatPriceOptions = {}
): string => {
    const { includeSymbol = true } = options;

    let compact: string;

    if (value >= 1_000_000_000) {
        compact = `${(value / 1_000_000_000).toFixed(value % 1_000_000_000 === 0 ? 0 : 1)}B`;
    } else if (value >= 1_000_000) {
        compact = `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
    } else if (value >= 1_000) {
        compact = `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
    } else {
        compact = value.toString();
    }

    if (!includeSymbol) return compact;

    return globalCurrency === 'VND' ? `${compact} ₫` : `$${compact}`;
};

/**
 * Format rút gọn khoảng giá (VD: 100K - 250K ₫)
 */
export const formatCompactPriceRange = (
    min: number,
    max: number,
    options: FormatPriceOptions = {}
): string => {
    if (min === max) return formatCompactPrice(min, options);

    const { includeSymbol = true } = options;

    if (!includeSymbol) {
        return `${formatCompactPrice(min, { includeSymbol: false })} - ${formatCompactPrice(max, { includeSymbol: false })}`;
    }

    // VND: đơn vị chỉ ở cuối
    if (globalCurrency === 'VND') {
        return `${formatCompactPrice(min, { includeSymbol: false })} - ${formatCompactPrice(max, { includeSymbol: false })} ₫`;
    }

    // USD: ký hiệu trước từng số
    return `${formatCompactPrice(min, { includeSymbol: true })} - ${formatCompactPrice(max, { includeSymbol: true })}`;
};
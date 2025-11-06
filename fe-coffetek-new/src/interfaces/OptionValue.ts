import { OptionValue } from "./types";


export interface OptionValueDetail extends OptionValue {
    option_group: {
        id: number;
        name: string;
    };
}

export interface EditableOptionValue extends OptionValue {
    isNew?: boolean;
    isUpdated?: boolean;
    isDeleted?: boolean;
}
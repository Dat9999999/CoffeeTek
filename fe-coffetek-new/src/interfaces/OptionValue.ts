export interface OptionValue {
    id: number;
    name: string;
    sort_index: number;
    option_group_id: number;
}

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
import { OptionValue } from "./OptionValue";

export interface OptionGroup {
    id: number;
    name: string;
    values?: OptionValue[];
}

export interface OptionGroupResponsePaging {
    data: OptionGroup[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}
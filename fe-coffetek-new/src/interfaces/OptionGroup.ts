import { OptionValue } from "./OptionValue";
import { OptionGroup } from "./types";



export interface OptionGroupResponsePaging {
    data: OptionGroup[];
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}
import { Role } from "./Role";

export interface User {
    id: number;
    email: string;
    phone_number: string;
    first_name: string,
    last_name: string,
    is_locked: boolean,
    detail?: UserDetail;
    roles?: Role[];
}

export interface UserDetail {
    id: number;
    birthday: string;
    sex: GenderEnum;
    avatar_url: string;
    address: string;
    userId: number;
}

export enum GenderEnum {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
}
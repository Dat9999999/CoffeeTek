import { IsNotEmpty, IsNumber, IsPhoneNumber } from "class-validator";

export class ExchangeVoucherDTO {

    @IsNotEmpty()
    @IsPhoneNumber('VN')
    customerPhone: string;
}
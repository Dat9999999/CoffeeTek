import { IsNotEmpty, IsString } from "class-validator";

export class RegisterFaceIDDto {
    @IsNotEmpty()
    @IsString()
    image: string; // base64 image
  
    @IsNotEmpty()
    @IsString()
    phone: string;
  }
  
  export class UpdateFaceIDDto {
    @IsNotEmpty()
    @IsString()
    image: string; // base64 image
  
    @IsNotEmpty()
    @IsString()
    phone: string;
  }
  
  export class LoginFaceIDDto {
    @IsNotEmpty()
    @IsString()
    image: string; // base64 image
  }
import { IsNotEmpty, isString } from "class-validator";

export class AuthDto {
    @IsNotEmpty()
    @isString()
    email: string;

    @IsNotEmpty()
    @isString()
    password: string;
}
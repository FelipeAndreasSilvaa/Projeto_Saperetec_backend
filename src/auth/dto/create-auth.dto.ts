import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class CreateAuthDto {
    @IsEmail()
    @IsNotEmpty({message: "Email é obrigatório"})
    email: string;
  
    @IsString()
    @MinLength(8)
    @IsNotEmpty({message: "Password é obrigatório"})
    password: string;
}

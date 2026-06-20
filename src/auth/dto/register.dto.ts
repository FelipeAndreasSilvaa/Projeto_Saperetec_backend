import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty({message: "Email é obrigatório"})
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty({message: "Password é obrigatório"})
  password: string;

  @IsString()
  @MinLength(2)
  @IsNotEmpty({message: "Nome é obrigatório"})
  name: string;

  @IsEnum(Role)
  @IsNotEmpty({message: "Role é obrigatório"})
  role: Role;

  @IsOptional()
  @IsString()
  teamId?: string;
}
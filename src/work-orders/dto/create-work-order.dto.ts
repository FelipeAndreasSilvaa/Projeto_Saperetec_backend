import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
    ValidateNested,
  } from 'class-validator';
  
  import { Type } from 'class-transformer';
  
  import { Priority } from '@prisma/client';
  
  class ChecklistItemDto {
    @IsString({
      message: 'O rótulo do checklist deve ser um texto.',
    })
    @IsNotEmpty({
      message: 'O rótulo do checklist é obrigatório.',
    })
    label: string;
  }
  
  export class CreateWorkOrderDto {
    @IsString({
      message: 'O título deve ser um texto.',
    })
    @IsNotEmpty({
      message: 'O título da ordem de serviço é obrigatório.',
    })
    @MinLength(3, {
      message: 'O título deve ter pelo menos 3 caracteres.',
    })
    title: string;
  
    @IsOptional()
    @IsString({
      message: 'A descrição deve ser um texto.',
    })
    description?: string;
  
    @IsOptional()
    @IsEnum(Priority, {
      message: 'A prioridade deve ser low, medium ou high.',
    })
    priority?: Priority;
  
    @IsString({
      message: 'O teamId deve ser um texto.',
    })
    @IsNotEmpty({
      message: 'O teamId é obrigatório.',
    })
    teamId: string;
  
    @IsOptional()
    @IsUUID('4', {
      message: 'O assigneeId deve ser um UUID válido.',
    })
    assigneeId?: string;
  
    @IsArray({
      message: 'O checklist deve ser uma lista.',
    })
    @ArrayMinSize(1, {
      message:
        'A ordem de serviço deve possuir pelo menos um item no checklist.',
    })
    @ValidateNested({ each: true })
    @Type(() => ChecklistItemDto)
    checklistItems: ChecklistItemDto[];
  }
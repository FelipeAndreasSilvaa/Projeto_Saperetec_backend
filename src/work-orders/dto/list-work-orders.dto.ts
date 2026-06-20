import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
  } from 'class-validator';
  
  import { Type } from 'class-transformer';
  
  import {
    Priority,
    WorkOrderStatus,
  } from '@prisma/client';
  
  export class ListWorkOrdersDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({
      message: 'A página deve ser um número inteiro.',
    })
    @Min(1, {
      message: 'A página deve ser maior ou igual a 1.',
    })
    page = 1;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt({
      message: 'O perPage deve ser um número inteiro.',
    })
    @Min(1, {
      message: 'O perPage deve ser maior ou igual a 1.',
    })
    @Max(100, {
      message: 'O perPage deve ser menor ou igual a 100.',
    })
    perPage = 20;
  
    @IsOptional()
    @IsEnum(WorkOrderStatus, {
      message:
        'O status deve ser open, in_progress ou done.',
    })
    status?: WorkOrderStatus;
  
    @IsOptional()
    @IsEnum(Priority, {
      message:
        'A prioridade deve ser low, medium ou high.',
    })
    priority?: Priority;
  
    @IsOptional()
    @IsString({
      message: 'O parâmetro sort deve ser um texto.',
    })
    sort?: string;
  }
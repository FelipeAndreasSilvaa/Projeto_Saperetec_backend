import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
  } from 'class-validator';
  
  import {
    Priority,
    WorkOrderStatus,
  } from '@prisma/client';
  
  export class UpdateWorkOrderDto {
    @IsOptional()
    @IsEnum(WorkOrderStatus)
    status?: WorkOrderStatus;
  
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;
  
    @IsOptional()
    @IsUUID()
    assigneeId?: string;
  
    @IsOptional()
    @IsString()
    @MinLength(10)
    resolutionNotes?: string;
  
    @IsOptional()
    @IsInt()
    version?: number;
  }
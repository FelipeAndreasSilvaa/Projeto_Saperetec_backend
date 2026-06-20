import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guard/jwt.auth.guard';

import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { ListWorkOrdersDto } from './dto/list-work-orders.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

import { WorkOrdersService } from './work-orders.service';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateWorkOrderDto,
    @Request() req: any,
  ) {
    return this.workOrdersService.create(dto, req.user);
  }

  @Get()
  findAll(
    @Query() query: ListWorkOrdersDto,
    @Request() req: any,
  ) {
    return this.workOrdersService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.workOrdersService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Request() req: any,
  ) {
    return this.workOrdersService.update(id, dto, req.user);
  }

  // @Get(':id/history')
  // history(
  //   @Param('id') id: string,
  //   @Request() req: any,
  // ) {
  //   return this.workOrdersService.history(id, req.user);
  // }
}
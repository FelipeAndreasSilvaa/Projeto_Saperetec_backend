import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListWorkOrdersDto } from './dto/list-work-orders.dto';
import { WorkOrderStatus } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<
  WorkOrderStatus,
  WorkOrderStatus[]
> = {
  open: ['in_progress'],
  in_progress: ['open', 'done'],
  done: [],
};

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}
  create(data: CreateWorkOrderDto, user: any) {
    return this.prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        teamId: data.teamId,
        assigneeId: data.assigneeId,

        checklistItems: {
          create: data.checklistItems,
        },
      },
      include: {
        checklistItems: true,
      },
    });
  }

  async findAll(query: ListWorkOrdersDto,user: any) {
    const {
      page = 1,
      perPage = 20,
      status,
      priority,
    } = query;
  
    const where = {
      ...this.buildScope(user),
      ...(status && { status }),
      ...(priority && { priority }),
    };
  
    const [data, total] = await this.prisma.$transaction([
      this.prisma.workOrder.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          checklistItems: true,
        },
      }),
  
      this.prisma.workOrder.count({
        where,
      }),
    ]);
  
    return {
      data,
  
      meta: {
        page,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string, user: any) {
    return this.prisma.workOrder.findFirst({
      where: {
        id,
        ...this.buildScope(user)
      },
  
      include: {
        checklistItems: true,
        events: true,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateWorkOrderDto,
    user: any,
  ) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        id,
        ...this.buildScope(user),
      },
    });
  
    if (!workOrder) {
      throw new NotFoundException();
    }


    if (dto.status) {
      this.validateStatusTransition(
        workOrder.status,
        dto.status,
      );
    }
  
    return this.prisma.workOrder.update({
      where: {
        id,
      },
  
      data: {
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        resolutionNotes: dto.resolutionNotes,
    
      },
    });
  }

  private buildScope(user: any) {
    switch (user.role) {
      case 'admin':
        return {};
  
      case 'supervisor':
        return {
          teamId: user.teamId,
        };
  
      case 'technician':
        return {
          teamId: user.teamId,
          assigneeId: user.id,
        };
  
      default:
        return {
          id: '__forbidden__',
        };
    }
  }

  private validateStatusTransition(
    currentStatus: WorkOrderStatus,
    nextStatus: WorkOrderStatus,
  ) {
    const allowedTransitions =
      ALLOWED_TRANSITIONS[currentStatus];
  
    const isAllowed =
      allowedTransitions.includes(nextStatus);
  
    if (!isAllowed) {
      throw new BadRequestException({
        code: 'FLX_INVALID_STATUS_TRANSITION',
        message: `Transição de status inválida: ${currentStatus} → ${nextStatus}`,
      });
    }
  }

}

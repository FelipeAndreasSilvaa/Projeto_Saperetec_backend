import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListWorkOrdersDto } from './dto/list-work-orders.dto';
import { WorkOrderStatus, Priority, Role, WorkOrder } from '@prisma/client';

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
    
      await this.validateStatusPreconditions(
        workOrder,
        dto,
        user,
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

  private async validateStatusPreconditions(
    workOrder: WorkOrder,
    dto: UpdateWorkOrderDto,
    user: any,
  ) {
    if (
      workOrder.status === 'open' &&
      dto.status === 'in_progress'
    ) {
      if (!dto.assigneeId && !workOrder.assigneeId) {
        throw new BadRequestException({
          code: 'FLX_VALIDATION_ERROR',
          message:
            'assigneeId é obrigatório para iniciar a ordem de serviço.',
        });
      }
  
      const assigneeId =
        dto.assigneeId ?? workOrder.assigneeId;
  
      const assignee = await this.prisma.user.findUnique({
        where: {
          id: assigneeId!,
        },
      });
  
      if (!assignee) {
        throw new BadRequestException({
          code: 'FLX_VALIDATION_ERROR',
          message: 'Técnico não encontrado.',
        });
      }
  
      if (assignee.role !== Role.technician) {
        throw new BadRequestException({
          code: 'FLX_VALIDATION_ERROR',
          message:
            'A ordem de serviço só pode ser atribuída a técnicos.',
        });
      }
  
      if (assignee.teamId !== workOrder.teamId) {
        throw new BadRequestException({
          code: 'FLX_VALIDATION_ERROR',
          message:
            'O técnico deve pertencer à mesma equipe da ordem de serviço.',
        });
      }
    }
  
    if (
      workOrder.status === 'in_progress' &&
      dto.status === 'done'
    ) {
      const resolutionNotes =
        dto.resolutionNotes?.trim();
  
      if (!resolutionNotes) {
        throw new BadRequestException({
          code: 'FLX_VALIDATION_ERROR',
          message:
            'resolutionNotes é obrigatório para concluir a ordem de serviço.',
        });
      }
  
      if (resolutionNotes.length < 10) {
        throw new BadRequestException({
          code: 'FLX_VALIDATION_ERROR',
          message:
            'resolutionNotes deve ter no mínimo 10 caracteres.',
        });
      }
  
      if (
        workOrder.priority === Priority.high &&
        ![Role.supervisor, Role.admin].includes(user.role)
      ) {
        throw new BadRequestException({
          code: 'FLX_FORBIDDEN',
          message:
            'Ordens de alta prioridade só podem ser concluídas por supervisor ou admin.',
        });
      }
    }
  
    if (
      workOrder.status === 'in_progress' &&
      dto.status === 'open'
    ) {
      const pendingItems =
        await this.prisma.checklistItem.count({
          where: {
            workOrderId: workOrder.id,
            completed: false,
          },
        });
  
      if (pendingItems === 0) {
        throw new BadRequestException({
          code: 'FLX_VALIDATION_ERROR',
          message:
            'A ordem de serviço só pode voltar para open se houver itens pendentes no checklist.',
        });
      }
    }
  }

}

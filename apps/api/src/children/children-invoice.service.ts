import { Inject, forwardRef, Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { ChildrenInvoice, childrenInvoiceSchema } from '../db/schemas';
import { ChildrenService } from './children.service';
import { eq } from 'drizzle-orm';
import { APIResponse } from 'src/utils/response';
import { CreateChildrenInvoiceDto } from './dto/create-children-invoice.dto';
import { UpdateChildrenInvoiceDto } from './dto/update-children-invoice.dto';

@Injectable()
export class ChildrenInvoiceService {
  constructor(
    private readonly dbService: DatabaseService,
    @Inject(forwardRef(() => ChildrenService))
    private readonly childrenService: ChildrenService
  ) {}

  async createChildrenInvoice(
    createChildrenInvoiceDto: CreateChildrenInvoiceDto
  ): Promise<APIResponse<ChildrenInvoice | undefined>> {
    const children = await this.childrenService.findOne(
      createChildrenInvoiceDto.children_id
    );
    if (!children.data) {
      return APIResponse.error<undefined>({
        message: 'Children not found',
        statusCode: 404,
      });
    }

    try {
      const [invoice] = await this.dbService.db
        .insert(childrenInvoiceSchema)
        .values({
          ...createChildrenInvoiceDto,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return APIResponse.success<ChildrenInvoice>({
        message: 'Children invoice created successfully',
        data: invoice,
        statusCode: 201,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to create children invoice: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async findAll(): Promise<APIResponse<ChildrenInvoice[] | undefined>> {
    try {
      const invoices = await this.dbService.db
        .select()
        .from(childrenInvoiceSchema)
        .orderBy(childrenInvoiceSchema.created_at);

      return APIResponse.success<ChildrenInvoice[]>({
        message: 'Children invoices retrieved successfully',
        data: invoices,
        statusCode: 200,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to retrieve children invoices: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async findOne(id: number): Promise<APIResponse<ChildrenInvoice | undefined>> {
    try {
      const [invoice] = await this.dbService.db
        .select()
        .from(childrenInvoiceSchema)
        .where(eq(childrenInvoiceSchema.id, id))
        .limit(1);

      if (!invoice) {
        return APIResponse.error<undefined>({
          message: 'Children invoice not found',
          statusCode: 404,
        });
      }

      return APIResponse.success<ChildrenInvoice>({
        message: 'Children invoice retrieved successfully',
        data: invoice,
        statusCode: 200,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to retrieve children invoice: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async findOneByExternalId(
    externalId: string
  ): Promise<APIResponse<ChildrenInvoice | undefined>> {
    const [invoice] = await this.dbService.db
      .select()
      .from(childrenInvoiceSchema)
      .where(eq(childrenInvoiceSchema.external_id, externalId))
      .limit(1);

    return APIResponse.success<ChildrenInvoice | undefined>({
      message: `Children invoice retrieved successfully for external id: ${externalId}`,
      data: invoice,
      statusCode: invoice ? 200 : 404,
    });
  }

  async update(
    id: number,
    updateData: UpdateChildrenInvoiceDto
  ): Promise<APIResponse<ChildrenInvoice | undefined>> {
    try {
      const [updatedInvoice] = await this.dbService.db
        .update(childrenInvoiceSchema)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(childrenInvoiceSchema.id, id))
        .returning();

      if (!updatedInvoice) {
        return APIResponse.error<undefined>({
          message: 'Children invoice not found',
          statusCode: 404,
        });
      }

      return APIResponse.success<ChildrenInvoice>({
        message: 'Children invoice updated successfully',
        data: updatedInvoice,
        statusCode: 200,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to update children invoice: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async remove(id: number): Promise<APIResponse<ChildrenInvoice | undefined>> {
    try {
      const [deletedInvoice] = await this.dbService.db
        .delete(childrenInvoiceSchema)
        .where(eq(childrenInvoiceSchema.id, id))
        .returning();

      if (!deletedInvoice) {
        return APIResponse.error<undefined>({
          message: 'Children invoice not found',
          statusCode: 404,
        });
      }

      return APIResponse.success<ChildrenInvoice>({
        message: 'Children invoice deleted successfully',
        data: deletedInvoice,
        statusCode: 200,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to delete children invoice: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }
}

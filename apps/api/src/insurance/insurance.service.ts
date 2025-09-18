import { Injectable } from '@nestjs/common';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { insuranceSchema, Insurance } from '../db/schemas/insuranceSchema';
import { DatabaseService } from '../db/drizzle.service';
import { ChildrenService } from '../children/children.service';
import { APIResponse } from 'src/utils/response';
import { eq } from 'drizzle-orm';
import { INSURANCE_STATUS } from 'src/utils/constants';
import { FileStorageService } from '../services/file-storage.service';

@Injectable()
export class InsuranceService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly childrenService: ChildrenService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async create(
    createInsuranceDto: CreateInsuranceDto,
    content: Express.Multer.File
  ): Promise<APIResponse<Insurance | undefined>> {
    try {
      const validation =
        this.checkInsuranceExpirationValidation(createInsuranceDto);
      if (!validation) {
        return validation;
      }
      const children = await this.childrenService.findOne(
        createInsuranceDto.children_id
      );
      if (!children) {
        return APIResponse.error<undefined>({
          message: 'Children not found',
          statusCode: 404,
        });
      }
      const insurance = await this.dbService.db
        .insert(insuranceSchema)
        .values({
          ...createInsuranceDto,
          status: INSURANCE_STATUS.PENDING,
        })
        .returning();

      const updatedInsurance = await this.uploadInsuranceDocument(
        content,
        insurance[0].id
      );

      return APIResponse.success<Insurance>({
        data: updatedInsurance,
        message: 'Insurance created successfully',
        statusCode: 201,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Insurance creation failed: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async findAll(): Promise<APIResponse<Insurance[]>> {
    const insurance = await this.dbService.db.select().from(insuranceSchema);
    return APIResponse.success<Insurance[]>({
      data: insurance,
      message: 'Insurance fetched successfully',
      statusCode: 200,
    });
  }

  async findOne(id: number): Promise<APIResponse<Insurance>> {
    const insurance = await this.dbService.db
      .select()
      .from(insuranceSchema)
      .where(eq(insuranceSchema.id, id))
      .limit(1);

    return APIResponse.success<Insurance>({
      data: insurance[0],
      message: 'Insurance fetched successfully',
      statusCode: 200,
    });
  }

  async update(
    id: number,
    updateInsuranceDto: UpdateInsuranceDto,
    content: Express.Multer.File
  ): Promise<APIResponse<Insurance | undefined>> {
    const insurance = await this.findOne(id);
    if (!insurance.data) {
      return APIResponse.error<undefined>({
        message: 'Insurance not found',
        statusCode: 404,
      });
    }
    const validation = this.checkInsuranceExpirationValidation(
      updateInsuranceDto as CreateInsuranceDto
    );
    if (!validation) {
      return validation;
    }
    if (content) {
      const fileUrl = await this.fileStorageService.uploadFile(
        content,
        'insurance_document',
        id
      );
      updateInsuranceDto.content = fileUrl.relativePath;
    }
    const updatedInsurance = await this.dbService.db
      .update(insuranceSchema)
      .set(updateInsuranceDto)
      .where(eq(insuranceSchema.id, id))
      .returning();

    return APIResponse.success<Insurance>({
      message: 'Insurance updated successfully',
      data: updatedInsurance[0],
      statusCode: 200,
    });
  }

  async remove(id: number): Promise<APIResponse<Insurance>> {
    const insurance = await this.dbService.db
      .delete(insuranceSchema)
      .where(eq(insuranceSchema.id, id))
      .returning();

    return APIResponse.success<Insurance>({
      data: insurance[0],
      message: 'Insurance removed successfully',
      statusCode: 200,
    });
  }

  private checkInsuranceExpirationValidation(
    createInsuranceDto: CreateInsuranceDto
  ) {
    if (createInsuranceDto.end_date < new Date()) {
      return APIResponse.error<undefined>({
        message: 'Invalid expiry date',
        statusCode: 400,
      });
    }
    return true;
  }

  async uploadInsuranceDocument(content: Express.Multer.File, id: number) {
    const fileUrl = await this.fileStorageService.uploadFile(
      content,
      'insurance_document',
      id
    );
    const updatedInsurance = await this.dbService.db
      .update(insuranceSchema)
      .set({ content: fileUrl.relativePath })
      .where(eq(insuranceSchema.id, id))
      .returning();
    return updatedInsurance[0];
  }
}

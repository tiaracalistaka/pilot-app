import { Controller, Get, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { SessionGuard } from '../common/guards/session.guard';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

@Controller('documents')
@UseGuards(SessionGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async getDocuments(): Promise<ApiResponse> {
    const documents = this.documentsService.getDocuments();

    return {
      success: true,
      data: documents,
      message: 'Documents retrieved successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}

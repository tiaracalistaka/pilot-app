import { Injectable } from '@nestjs/common';
import { DataLoaderService, DocumentRecord } from '../common/services/data-loader.service';

export interface DocumentWithStatus extends DocumentRecord {
  status: 'safe' | 'soon' | 'expired';
  daysUntilExpiry: number;
}

@Injectable()
export class DocumentsService {
  private readonly TODAY = new Date('2026-05-15');

  constructor(private readonly dataLoader: DataLoaderService) {}

  getDocuments(): DocumentWithStatus[] {
    const documentsData = this.dataLoader.getDocumentsData();
    if (!documentsData?.documents) return [];

    return documentsData.documents.map((doc) => {
      const expiryDate = new Date(doc.expiryDate);
      const timeDiff = expiryDate.getTime() - this.TODAY.getTime();
      const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      let status: 'safe' | 'soon' | 'expired';
      if (daysUntilExpiry < 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= documentsData.thresholdDays.soon) {
        status = 'soon';
      } else {
        status = 'safe';
      }

      return {
        ...doc,
        status,
        daysUntilExpiry,
      };
    });
  }
}

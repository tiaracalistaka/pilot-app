import { Injectable } from '@nestjs/common';
import { DataLoaderService, FlightHourRecord } from '../common/services/data-loader.service';

export interface RollingSumResult {
  date: string;
  rollingSum: number;
}

export interface ChartBounds {
  limit: number;
  yMax: number;
}

export interface LimitSummary {
  daily: { current: number; limit: number };
  weekly: { current: number; limit: number };
  monthly: { current: number; limit: number };
  annual: { current: number; limit: number };
}

@Injectable()
export class FlightHoursService {
  private readonly TODAY = new Date('2026-05-15');

  constructor(private readonly dataLoader: DataLoaderService) {}

  rollingWindow(
    records: FlightHourRecord[],
    endDate: Date,
    days: number,
  ): number {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days + 1);

    return records
      .filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      })
      .reduce((sum, record) => sum + record.hours, 0);
  }

  getFlightHours(from: string, to: string): FlightHourRecord[] {
    return this.dataLoader.getFlightHoursForRange(from, to);
  }

  getFlightHoursSummary(range: string): RollingSumResult[] {
    const flightData = this.dataLoader.getFlightHoursData();
    if (!flightData?.records) return [];

    const daysMap: { [key: string]: number } = {
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
    };

    const days = daysMap[range] || 7;
    const results: RollingSumResult[] = [];

    const startDate = new Date(this.TODAY);
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date(this.TODAY);
    endDate.setDate(endDate.getDate() + 7);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      if (d > this.TODAY) {
        const rollingSum = this.rollingWindow(flightData.records, this.TODAY, days);
        results.push({ date: dateStr, rollingSum });
      } else {
        const rollingSum = this.rollingWindow(flightData.records, new Date(d), days);
        results.push({ date: dateStr, rollingSum });
      }
    }

    return results;
  }

  getLimits(): { limits: { daily: number; weekly: number; monthly: number; annual: number }; chartBounds: { [key: string]: ChartBounds } } {
    const flightData = this.dataLoader.getFlightHoursData();
    return {
      limits: flightData?.limits || { daily: 8, weekly: 40, monthly: 100, annual: 1050 },
      chartBounds: flightData?.chartBounds || {
        '1w': { limit: 40, yMax: 45 },
        '1m': { limit: 100, yMax: 125 },
        '3m': { limit: 300, yMax: 325 },
        '6m': { limit: 600, yMax: 625 },
        '1y': { limit: 1050, yMax: 1200 },
      },
    };
  }

  getLimitSummary(): LimitSummary {
    const flightData = this.dataLoader.getFlightHoursData();
    const records = flightData?.records || [];

    const limits = flightData?.limits || { daily: 8, weekly: 40, monthly: 100, annual: 1050 };

    return {
      daily: {
        current: this.rollingWindow(records, this.TODAY, 1),
        limit: limits.daily,
      },
      weekly: {
        current: this.rollingWindow(records, this.TODAY, 7),
        limit: limits.weekly,
      },
      monthly: {
        current: this.rollingWindow(records, this.TODAY, 30),
        limit: limits.monthly,
      },
      annual: {
        current: this.rollingWindow(records, this.TODAY, 365),
        limit: limits.annual,
      },
    };
  }
}

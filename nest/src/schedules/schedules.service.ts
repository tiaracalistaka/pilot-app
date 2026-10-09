import { Injectable } from '@nestjs/common';
import { DataLoaderService, ScheduleEntry, ScheduleLegend } from '../common/services/data-loader.service';

export interface ScheduleWithStatus extends ScheduleEntry {
  isComplete: boolean;
  remainingDuties: number;
}

export interface MonthSchedule {
  year: number;
  month: number;
  schedules: ScheduleWithStatus[];
  legend: ScheduleLegend[];
}

@Injectable()
export class SchedulesService {
  constructor(private readonly dataLoader: DataLoaderService) {}

  getSchedules(year: string, month: string): MonthSchedule {
    const schedulesData = this.dataLoader.getSchedulesData();
    const records = schedulesData?.schedules || [];

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    const monthSchedules = records
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return (
          scheduleDate.getFullYear() === yearNum &&
          scheduleDate.getMonth() + 1 === monthNum
        );
      })
      .map((schedule) => {
        const isComplete = schedule.countLogbooks >= schedule.countSchedules;
        const remainingDuties = Math.max(0, schedule.countSchedules - schedule.countLogbooks);

        return {
          ...schedule,
          isComplete,
          remainingDuties,
        };
      });

    return {
      year: yearNum,
      month: monthNum,
      schedules: monthSchedules,
      legend: schedulesData?.legend || [],
    };
  }
}

import { Injectable } from '@nestjs/common';
import { IsString, Matches, IsOptional } from 'class-validator';

export class SchedulesQueryDto {
  @IsString()
  @Matches(/^\d{4}$/, { message: 'year must be a 4-digit year' })
  year!: string;

  @IsString()
  @Matches(/^(0?[1-9]|1[0-2])$/, { message: 'month must be between 1 and 12' })
  month!: string;
}

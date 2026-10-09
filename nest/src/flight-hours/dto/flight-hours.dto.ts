import { IsString, Matches } from 'class-validator';

export class FlightHoursQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'from must be in YYYY-MM-DD format',
  })
  from!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'to must be in YYYY-MM-DD format',
  })
  to!: string;
}

export class FlightHoursSummaryQueryDto {
  @IsString()
  @Matches(/^(1w|1m|3m|6m|1y)$/, {
    message: 'range must be one of: 1w, 1m, 3m, 6m, 1y',
  })
  range!: string;
}

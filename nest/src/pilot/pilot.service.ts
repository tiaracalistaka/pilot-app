import { Injectable } from '@nestjs/common';
import { DataLoaderService, PilotProfile } from '../common/services/data-loader.service';

@Injectable()
export class PilotService {
  constructor(private readonly dataLoader: DataLoaderService) {}

  getProfile(): PilotProfile | null {
    const pilots = this.dataLoader.getPilots();
    if (pilots.length === 0) return null;

    const pilot = pilots[0];

    const flightData = this.dataLoader.getFlightHoursData();
    const totalHours = flightData?.records?.reduce((sum, r) => sum + r.hours, 0) || 0;

    return {
      id: pilot.id,
      name: pilot.name,
      username: pilot.username,
      avatar: pilot.avatar,
      totalFlightHours: totalHours,
    };
  }

  getProfileById(userId: string): PilotProfile | null {
    const pilot = this.dataLoader.getPilotById(userId);
    if (!pilot) return null;

    const flightData = this.dataLoader.getFlightHoursData();
    const totalHours = flightData?.records?.reduce((sum, r) => sum + r.hours, 0) || 0;

    return {
      id: pilot.id,
      name: pilot.name,
      username: pilot.username,
      avatar: pilot.avatar,
      totalFlightHours: totalHours,
    };
  }
}

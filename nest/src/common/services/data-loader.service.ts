import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface PilotAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  totalFlightHours: number;
  createdAt: string;
  lastPasswordChange: string;
}

export interface PilotsData {
  pilots: PilotAccount[];
}

export interface FlightHourRecord {
  date: string;
  hours: number;
}

export interface LimitsConfig {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export interface ChartBoundsConfig {
  [key: string]: {
    limit: number;
    yMax: number;
  };
}

export interface FlightHoursData {
  records: FlightHourRecord[];
  limits: LimitsConfig;
  chartBounds: ChartBoundsConfig;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  expiryDate: string;
  thresholdDays: number;
}

export interface DocumentsData {
  documents: DocumentRecord[];
  thresholdDays: {
    safe: number;
    soon: number;
  };
}

export interface ScheduleEntry {
  id: string;
  date: string;
  dutyType: string;
  baseColor: string;
  countSchedules: number;
  countLogbooks: number;
}

export interface ScheduleLegend {
  type: string;
  name: string;
  color: string;
}

export interface SchedulesData {
  schedules: ScheduleEntry[];
  legend: ScheduleLegend[];
}

export interface PilotProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  totalFlightHours: number;
}

@Injectable()
export class DataLoaderService {
  private pilotsData: PilotsData | null = null;
  private flightHoursData: FlightHoursData | null = null;
  private documentsData: DocumentsData | null = null;
  private schedulesData: SchedulesData | null = null;

  private readonly dataPath: string;

  constructor() {
    
    const projectRoot = process.cwd();
    this.dataPath = path.join(projectRoot, 'data');
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loadPilotsData();
    this.loadFlightHoursData();
    this.loadDocumentsData();
    this.loadSchedulesData();
  }

  private loadPilotsData(): void {
    try {
      const pilotsPath = path.join(this.dataPath, 'mock-pilots.json');
      if (fs.existsSync(pilotsPath)) {
        this.pilotsData = JSON.parse(fs.readFileSync(pilotsPath, 'utf-8'));
        console.log(`📦 Loaded ${this.pilotsData?.pilots?.length || 0} pilot accounts`);
      } else {
        console.warn('⚠️ mock-pilots.json not found');
        this.pilotsData = { pilots: [] };
      }
    } catch (error) {
      console.error('Error loading pilots data:', error);
      this.pilotsData = { pilots: [] };
    }
  }

  private loadFlightHoursData(): void {
    try {
      const fhPath = path.join(this.dataPath, 'mock-flight-hours.json');
      if (fs.existsSync(fhPath)) {
        this.flightHoursData = JSON.parse(fs.readFileSync(fhPath, 'utf-8'));
        console.log(`📦 Loaded ${this.flightHoursData?.records?.length || 0} flight hour records`);
      }
    } catch (error) {
      console.error('Error loading flight hours data:', error);
      this.flightHoursData = { records: [], limits: { daily: 8, weekly: 40, monthly: 100, annual: 1050 }, chartBounds: {} };
    }
  }

  private loadDocumentsData(): void {
    try {
      const docPath = path.join(this.dataPath, 'mock-documents.json');
      if (fs.existsSync(docPath)) {
        this.documentsData = JSON.parse(fs.readFileSync(docPath, 'utf-8'));
        console.log(`📦 Loaded ${this.documentsData?.documents?.length || 0} documents`);
      }
    } catch (error) {
      console.error('Error loading documents data:', error);
      this.documentsData = { documents: [], thresholdDays: { safe: 90, soon: 30 } };
    }
  }

  private loadSchedulesData(): void {
    try {
      const schedPath = path.join(this.dataPath, 'mock-schedules.json');
      if (fs.existsSync(schedPath)) {
        this.schedulesData = JSON.parse(fs.readFileSync(schedPath, 'utf-8'));
        console.log(`📦 Loaded ${this.schedulesData?.schedules?.length || 0} schedules`);
      }
    } catch (error) {
      console.error('Error loading schedules data:', error);
      this.schedulesData = { schedules: [], legend: [] };
    }
  }

  getPilots(): Omit<PilotAccount, 'password'>[] {
    if (!this.pilotsData?.pilots) return [];
    return this.pilotsData.pilots.map(({ password, ...rest }) => rest);
  }

  getPilotByUsername(username: string): PilotAccount | null {
    if (!this.pilotsData?.pilots) return null;
    return this.pilotsData.pilots.find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    ) || null;
  }

  getPilotById(id: string): Omit<PilotAccount, 'password'> | null {
    if (!this.pilotsData?.pilots) return null;
    const pilot = this.pilotsData.pilots.find((p) => p.id === id);
    if (!pilot) return null;
    const { password, ...rest } = pilot;
    return rest;
  }

  getFlightHoursData(): FlightHoursData | null {
    return this.flightHoursData;
  }

  getFlightHoursForRange(from: string, to: string): FlightHourRecord[] {
    if (!this.flightHoursData?.records) return [];

    return this.flightHoursData.records.filter((record) => {
      const date = new Date(record.date);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return date >= fromDate && date <= toDate;
    });
  }


  getDocumentsData(): DocumentsData | null {
    return this.documentsData;
  }


  getSchedulesData(): SchedulesData | null {
    return this.schedulesData;
  }
}

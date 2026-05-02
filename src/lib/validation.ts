import { z } from 'zod';

// Rule: Never trust raw health data -> always validate + timestamp + source

export const SourceEnum = z.enum(["manual", "apple_healthkit", "google_fit", "fitbit"]);

const BaseHealthDataSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  source: SourceEnum,
});

export const VitalsDataSchema = BaseHealthDataSchema.extend({
  heartRate: z.number().int().min(30).max(250),
  sysBp: z.number().int().min(70).max(250),
  diaBp: z.number().int().min(40).max(150),
});

export const SleepDataSchema = BaseHealthDataSchema.extend({
  hours: z.number().min(0).max(24),
  quality: z.enum(["Poor", "Fair", "Good", "Excellent"]).optional(),
});

export const HealthProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().min(0).max(120),
  weight: z.number().min(0).max(500),
  height: z.number().min(0).max(300),
  conditions: z.array(z.string()).default([]),
  consentGiven: z.boolean().default(false),
  avatarUrl: z.string().optional(),
  dailyGoals: z.object({
    steps: z.number().optional().default(10000),
    water: z.number().optional().default(2000),
  }).optional().default({ steps: 10000, water: 2000 }),
});

export type VitalsData = z.infer<typeof VitalsDataSchema>;
export type SleepData = z.infer<typeof SleepDataSchema>;
export type HealthProfile = z.infer<typeof HealthProfileSchema>;

export class DataNormalizationEngine {
  static ingestVitals(rawData: unknown): VitalsData {
    try {
      const parsed = VitalsDataSchema.parse(rawData);
      return parsed;
    } catch (error) {
      console.error("Vitals Validation Error:", error);
      throw new Error("Invalid vitals data payload. Rejected by validation engine.");
    }
  }

  static ingestSleep(rawData: unknown): SleepData {
    try {
      return SleepDataSchema.parse(rawData);
    } catch (error) {
       console.error("Sleep Validation Error:", error);
       throw new Error("Invalid sleep data payload. Rejected by validation engine.");
    }
  }

  static ingestProfile(rawData: unknown): HealthProfile {
      try {
          return HealthProfileSchema.parse(rawData);
      } catch (error) {
          console.error("Profile Validation Error:", error);
          throw new Error("Invalid profile payload. Rejected by validation engine.");
      }
  }
}

/**
 * FHIR (Fast Healthcare Interoperability Resources) Integration Layer
 * This module provides utilities to map local biometric data to FHIR-compliant resources.
 * Essential for the "Agents Assemble" hackathon requirements (Interoperability & FHIR).
 */

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    lastUpdated: string;
  };
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  name: [{
    use: 'official';
    text: string;
  }];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'final';
  category: [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/observation-category';
      code: 'vital-signs';
      display: 'Vital Signs';
    }];
  }];
  code: {
    coding: [{
      system: 'http://loinc.org';
      code: string;
      display: string;
    }];
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: 'http://unitsofmeasure.org';
    code: string;
  };
}

/**
 * Maps local profile data to a FHIR Patient resource.
 */
export function mapToFHIRPatient(profile: any): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: 'user-01',
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    name: [{
      use: 'official',
      text: profile.name || 'Anonymous User',
    }],
    birthDate: profile.age ? new Date(new Date().getFullYear() - profile.age, 0, 1).toISOString().split('T')[0] : undefined,
  };
}

/**
 * Maps a biometric reading to a FHIR Observation resource.
 */
export function mapToFHIRObservation(type: string, value: number, unit: string, loincCode: string, display: string): FHIRObservation {
  return {
    resourceType: 'Observation',
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'vital-signs',
        display: 'Vital Signs',
      }],
    }],
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: loincCode,
        display: display,
      }],
    },
    subject: {
      reference: 'Patient/user-01',
    },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value,
      unit,
      system: 'http://unitsofmeasure.org',
      code: unit === 'bpm' ? '/min' : unit,
    },
  };
}

/**
 * LOINC Codes for common vitals
 */
export const LOINC = {
  HEART_RATE: '8867-4',
  BLOOD_PRESSURE_SYSTOLIC: '8480-6',
  BLOOD_PRESSURE_DIASTOLIC: '8462-4',
  BODY_WEIGHT: '29463-7',
  BODY_HEIGHT: '8302-2',
  STEP_COUNT: '55423-8', // Step count per day
};

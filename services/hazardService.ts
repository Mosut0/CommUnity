// Legacy hazard service - now uses centralized report service
// This file is kept for backward compatibility but delegates to the new service

import { createReport } from '@/services/reportService';
import { CreateHazardReportData } from '@/types/report';

interface HazardData {
  hazardType: string;
  description: string;
  location: string;
  date: Date;
  imageUri?: string;
}

export async function submitHazard(data: HazardData, userId: string) {
  try {
    const reportData = {
      type: 'hazard' as const,
      data: {
        hazardType: data.hazardType,
        description: data.description,
        location: data.location,
        date: data.date,
        imageUri: data.imageUri,
      } as CreateHazardReportData,
    };

    const result = await createReport(reportData, userId);
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error submitting hazard:', error);
    return { success: false, error };
  }
}

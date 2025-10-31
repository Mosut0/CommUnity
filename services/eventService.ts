// Legacy event service - now uses centralized report service
// This file is kept for backward compatibility but delegates to the new service

import { createReport } from '@/services/reportService';
import { CreateEventReportData } from '@/types/report';

interface EventData {
  eventType: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  imageUri?: string;
}

export async function submitEvent(data: EventData, userId: string) {
  try {
    const reportData = {
      type: 'event' as const,
      data: {
        eventType: data.eventType,
        description: data.description,
        location: data.location,
        date: data.date,
        time: data.time,
        imageUri: data.imageUri,
      } as CreateEventReportData,
    };

    const result = await createReport(reportData, userId);
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error submitting event:', error);
    return { success: false, error };
  }
}

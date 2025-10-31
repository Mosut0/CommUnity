// Legacy lost and found service - now uses centralized report service
// This file is kept for backward compatibility but delegates to the new service

import { createReport } from '@/services/reportService';
import {
  CreateLostItemReportData,
  CreateFoundItemReportData,
} from '@/types/report';

interface LostItemData {
  itemName: string;
  description: string;
  location: string;
  date: Date;
  contactInfo: string;
  imageUri?: string;
}

interface FoundItemData {
  itemName: string;
  description: string;
  location: string;
  contactInfo: string;
  imageUri?: string;
}

export async function submitLostItem(data: LostItemData, userId: string) {
  try {
    const reportData = {
      type: 'lost' as const,
      data: {
        itemName: data.itemName,
        description: data.description,
        location: data.location,
        date: data.date,
        contactInfo: data.contactInfo,
        imageUri: data.imageUri,
      } as CreateLostItemReportData,
    };

    const result = await createReport(reportData, userId);
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error submitting lost item:', error);
    return { success: false, error };
  }
}

export async function submitFoundItem(data: FoundItemData, userId: string) {
  try {
    const reportData = {
      type: 'found' as const,
      data: {
        itemName: data.itemName,
        description: data.description,
        location: data.location,
        contactInfo: data.contactInfo,
        imageUri: data.imageUri,
      } as CreateFoundItemReportData,
    };

    const result = await createReport(reportData, userId);
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error submitting found item:', error);
    return { success: false, error };
  }
}

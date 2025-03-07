import { createClient } from '@supabase/supabase-js';
import { uploadImage } from '@/services/imageService';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HazardData {
  hazardType: string;
  description: string;
  location: string;
  date: Date;
  imageUri?: string;
}

// Convert location string to latitude and longitude
function locationToPoint(locationStr: string): { lat: number; lng: number } {
  // Expecting locationStr in the format "lat,lng"
  const parts = locationStr.split(',');
  if (parts.length !== 2) {
    return { lat: 0, lng: 0 };
  }
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) {
    return { lat: 0, lng: 0 };
  }
  return { lat, lng };
}

export async function submitHazard(data: HazardData, userId: string) {
  try {
    // Upload image if provided
    let imageUrl = null;
    if (data.imageUri) {
      imageUrl = await uploadImage(data.imageUri);
    }

    // Insert report into 'reports' table
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        userid: userId,
        category: 'safety',
        description: data.description,
        location: `(${locationToPoint(data.location).lat},${locationToPoint(data.location).lng})`,
        imageurl: imageUrl
      })
      .select();

    if (reportError) {
      console.error('Report insert error:', reportError);
      throw reportError;
    }

    if (!reportData || reportData.length === 0) {
      throw new Error('No report data returned after insert');
    }

    const reportId = reportData[0].reportid;

    // Insert hazard details into 'hazards' table
    const { error: hazardError } = await supabase
      .from('hazards')
      .insert({
        reportid: reportId,
        hazardtype: data.hazardType,
      });

    if (hazardError) {
      console.error('Hazard insert error:', hazardError);
      throw hazardError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting hazard:', error);
    return { success: false, error };
  }
}
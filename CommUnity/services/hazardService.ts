import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HazardData {
  hazardType: string;
  description: string;
  location: string;
  date: Date;
}

function locationToPoint(locationStr: string): { lat: number; lng: number } {
  // Temporary implementation
  return { lat: 0, lng: 0 };
}

export async function submitHazard(data: HazardData, userId: string) {
  try {
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        userid: userId,
        category: 'safety',
        description: data.description,
        location: `(${locationToPoint(data.location).lat},${locationToPoint(data.location).lng})`,
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
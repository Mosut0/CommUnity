import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface LostItemData {
  itemName: string;
  description: string;
  location: string;
  date: Date;
  contactInfo: string;
}

interface FoundItemData {
  itemName: string;
  description: string;
  location: string;
  contactInfo: string;
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

export async function submitLostItem(data: LostItemData, userId: string) {
  try {
    // Insert report into 'reports' table
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        userid: userId,
        category: 'lost',
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
    
    // Insert lost item details into 'lostitems' table
    const { error: lostItemError } = await supabase
      .from('lostitems')
      .insert({
        reportid: reportId,
        itemtype: data.itemName,
        contactinfo: data.contactInfo,
      });

    if (lostItemError) {
      console.error('Lost item insert error:', lostItemError);
      throw lostItemError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting lost item:', error);
    return { success: false, error };
  }
}

export async function submitFoundItem(data: FoundItemData, userId: string) {
  try {
    // Insert report into 'reports' table
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        userid: userId,
        category: 'found',
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
    
    // Insert found item details into 'founditems' table
    const { error: foundItemError } = await supabase
      .from('founditems')
      .insert({
        reportid: reportId,
        itemtype: data.itemName,
        contactinfo: data.contactInfo,
      });

    if (foundItemError) {
      console.error('Found item insert error:', foundItemError);
      throw foundItemError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting found item:', error);
    return { success: false, error };
  }
}
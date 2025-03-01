import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

function locationToPoint(locationStr: string): { lat: number; lng: number } {
  //temporary
  return { lat: 0, lng: 0 };
}

export async function submitLostItem(data: LostItemData, userId: string) {
  try {
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
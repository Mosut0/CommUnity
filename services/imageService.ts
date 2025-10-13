import { supabase } from '@/lib/supabase';

export async function uploadImage(uri: string): Promise<string | null> {
  try {
    // Read the image as an ArrayBuffer via fetch — this works in React
    // Native runtimes where response.blob() may not be available.
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Uint8Array(arrayBuffer);

    // Generate a unique filename using timestamp and random number
    const fileExt = uri.split('.').pop();
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `image_${timestamp}_${randomString}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    // Upload image to Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, blob, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      });

    if (error) {
      console.error('Error uploading image: ', error);
      return null;
    }

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage: ', error);
    return null;
  }
}

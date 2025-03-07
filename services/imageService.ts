import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export async function uploadImage(uri: string): Promise<string | null> {
  try {
    // Read the image and convert to base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Generate a unique filename using timestamp and random number
    const fileExt = uri.split(".").pop();
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `image_${timestamp}_${randomString}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    // Upload image to Supabase Storage
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
      });

    if (error) {
      console.error("Error uploading image: ", error);
      return null;
    }

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImage: ", error);
    return null;
  }
}

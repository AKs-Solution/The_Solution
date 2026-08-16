import fs from "fs";
import path from "path";

export async function uploadDrawingFile(
  fileName: string,
  buffer: Buffer,
): Promise<{ fileUrl: string; fileKey: string }> {
  const fileExtension = path.extname(fileName);
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storedName = `${uniqueId}${fileExtension}`;
  const localPath = path.join(uploadsDir, storedName);
  fs.writeFileSync(localPath, buffer);

  return {
    fileUrl: `/uploads/${storedName}`,
    fileKey: storedName,
  };
}

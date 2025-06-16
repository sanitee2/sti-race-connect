import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// Configuration for QR code generation
const QR_CODE_CONFIG = {
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
  type: 'image/png' as const,
};

// Directory to store QR codes (you can also use cloud storage)
const QR_CODES_DIR = path.join(process.cwd(), 'public', 'qr-codes');

/**
 * Generate QR code data based on participant information
 */
export function generateQRCodeData(participantId: string, options?: {
  format?: 'simple' | 'structured';
  includeMetadata?: boolean;
}): string {
  const { format = 'simple', includeMetadata = false } = options || {};

  if (format === 'simple') {
    return participantId;
  }

  // Structured format with minimal data for smaller QR codes
  const qrData = {
    p: participantId, // participant ID (shortened key)
    t: Date.now(),   // timestamp for verification
  };

  return JSON.stringify(qrData);
}

/**
 * Generate QR code image as base64 data URL
 */
export async function generateQRCodeImage(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, QR_CODE_CONFIG);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw new Error('Failed to generate QR code image');
  }
}

/**
 * Save QR code image to file system
 */
export async function saveQRCodeToFile(
  participantId: string, 
  qrCodeDataURL: string
): Promise<string> {
  try {
    // Ensure QR codes directory exists
    await fs.mkdir(QR_CODES_DIR, { recursive: true });

    // Extract base64 data from data URL
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    
    // Generate filename
    const filename = `participant-${participantId}.png`;
    const filepath = path.join(QR_CODES_DIR, filename);
    
    // Save file
    await fs.writeFile(filepath, base64Data, 'base64');
    
    // Return public URL
    return `/qr-codes/${filename}`;
  } catch (error) {
    console.error('Error saving QR code to file:', error);
    throw new Error('Failed to save QR code to file');
  }
}

/**
 * Generate and save QR code for a participant
 */
export async function generateAndSaveParticipantQRCode(
  participantId: string,
  options?: {
    format?: 'simple' | 'structured';
    saveToFile?: boolean;
  }
): Promise<{
  qrCodeData: string;
  qrCodeURL: string;
  qrCodeFileURL?: string;
}> {
  const { format = 'simple', saveToFile = true } = options || {};

  try {
    // Generate QR code data
    const qrCodeData = generateQRCodeData(participantId, { format });
    
    // Generate QR code image
    const qrCodeURL = await generateQRCodeImage(qrCodeData);
    
    let qrCodeFileURL: string | undefined;
    
    // Save to file if requested
    if (saveToFile) {
      qrCodeFileURL = await saveQRCodeToFile(participantId, qrCodeURL);
    }

    return {
      qrCodeData,
      qrCodeURL, // base64 data URL
      qrCodeFileURL, // file system URL
    };
  } catch (error) {
    console.error('Error generating and saving QR code:', error);
    throw new Error('Failed to generate and save QR code');
  }
}

/**
 * Update participant record with generated QR code
 */
export async function updateParticipantWithQRCode(
  participantId: string,
  options?: {
    format?: 'simple' | 'structured';
    saveToFile?: boolean;
  }
): Promise<{
  participantId: string;
  qrCodeData: string;
  qrCodeURL: string;
  qrCodeFileURL?: string;
}> {
  try {
    // Generate QR code
    const qrCodeResult = await generateAndSaveParticipantQRCode(participantId, options);
    
    // Update participant record in database
    await prisma.participants.update({
      where: { id: participantId },
      data: {
        qr_code_data: qrCodeResult.qrCodeData,
        qr_code_url: qrCodeResult.qrCodeFileURL || qrCodeResult.qrCodeURL,
      },
    });

    return {
      participantId,
      ...qrCodeResult,
    };
  } catch (error) {
    console.error('Error updating participant with QR code:', error);
    throw new Error('Failed to update participant with QR code');
  }
}

/**
 * Bulk generate QR codes for multiple participants
 */
export async function bulkGenerateQRCodes(
  participantIds: string[],
  options?: {
    format?: 'simple' | 'structured';
    saveToFile?: boolean;
    batchSize?: number;
  }
): Promise<{
  successful: string[];
  failed: Array<{ participantId: string; error: string }>;
}> {
  const { batchSize = 10 } = options || {};
  const successful: string[] = [];
  const failed: Array<{ participantId: string; error: string }> = [];

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < participantIds.length; i += batchSize) {
    const batch = participantIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (participantId) => {
      try {
        await updateParticipantWithQRCode(participantId, options);
        successful.push(participantId);
      } catch (error) {
        failed.push({
          participantId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    await Promise.all(batchPromises);
  }

  return { successful, failed };
}

/**
 * Get participant QR code (generate if not exists)
 */
export async function getOrGenerateParticipantQRCode(
  participantId: string,
  options?: {
    format?: 'simple' | 'structured';
    forceRegenerate?: boolean;
  }
): Promise<{
  qrCodeData: string;
  qrCodeURL: string;
  isNewlyGenerated: boolean;
}> {
  const { forceRegenerate = false } = options || {};

  try {
    // Get participant with existing QR code
    const participant = await prisma.participants.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        qr_code_data: true,
        qr_code_url: true,
      },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    // Return existing QR code if available and not forcing regeneration
    if (!forceRegenerate && participant.qr_code_data && participant.qr_code_url) {
      return {
        qrCodeData: participant.qr_code_data,
        qrCodeURL: participant.qr_code_url,
        isNewlyGenerated: false,
      };
    }

    // Generate new QR code
    const qrCodeResult = await updateParticipantWithQRCode(participantId, options);
    
    return {
      qrCodeData: qrCodeResult.qrCodeData,
      qrCodeURL: qrCodeResult.qrCodeFileURL || qrCodeResult.qrCodeURL,
      isNewlyGenerated: true,
    };
  } catch (error) {
    console.error('Error getting or generating participant QR code:', error);
    throw new Error('Failed to get or generate participant QR code');
  }
}

/**
 * Delete QR code file
 */
export async function deleteQRCodeFile(participantId: string): Promise<void> {
  try {
    const filename = `participant-${participantId}.png`;
    const filepath = path.join(QR_CODES_DIR, filename);
    
    await fs.unlink(filepath);
  } catch (error) {
    // Ignore file not found errors
    if ((error as any)?.code !== 'ENOENT') {
      console.error('Error deleting QR code file:', error);
    }
  }
} 
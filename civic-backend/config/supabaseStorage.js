const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase Storage] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — media uploads will fail');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'civic-reports';

/**
 * Upload a file to Supabase Storage and return the public URL.
 * @param {Object} options
 * @param {string} options.filePath - Local path to the file (from multer)
 * @param {string} options.fileName - Desired file name in storage
 * @param {string} options.mimeType - MIME type of the file
 * @returns {{ url: string, storagePath: string }}
 */
async function uploadFile({ filePath, fileName, mimeType }) {
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(filePath);

    // Create a unique path: civic-reports/2026/03/media-1234567890.jpg
    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const storagePath = `${datePath}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: false
        });

    if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

    // Clean up local temp file
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

    return {
        url: urlData.publicUrl,
        storagePath: storagePath
    };
}

/**
 * Delete a file from Supabase Storage.
 * @param {string} storagePath - The path in the bucket (stored as cloudinaryId field in DB)
 */
async function deleteFile(storagePath) {
    if (!storagePath) return;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

    if (error) {
        console.error('[Supabase Storage] Delete failed:', error.message);
    }
}

module.exports = {
    supabase,
    uploadFile,
    deleteFile,
    BUCKET_NAME
};

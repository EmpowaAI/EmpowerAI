/**
 * File Parser Utility
 * Extracts text from PDF and DOCX files
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Extract text from PDF file
 * Uses a simple approach - for production, consider using pdf-parse or similar
 */
async function extractTextFromPDF(filePath) {
  try {
    // For now, we'll send the file to AI service which has PyPDF2
    // This is a placeholder - in production, you might want to use pdf-parse here
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer; // Return buffer to send to AI service
  } catch (error) {
    throw new Error(`Failed to read PDF file: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(filePath) {
  try {
    // For DOCX, we'll also send to AI service which has python-docx
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer; // Return buffer to send to AI service
  } catch (error) {
    throw new Error(`Failed to read DOCX file: ${error.message}`);
  }
}

/**
 * Extract text from TXT file
 */
async function extractTextFromTXT(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf-8');
    return text;
  } catch (error) {
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}

/**
 * Determine file type from extension
 */
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'pdf';
    case '.docx':
      return 'docx';
    case '.doc':
      return 'doc'; // Note: .doc is harder to parse, might need conversion
    case '.txt':
      return 'txt';
    default:
      return null;
  }
}

/**
 * Extract text from file based on type
 */
async function extractTextFromFile(filePath, filename) {
  const fileType = getFileType(filename);
  
  if (!fileType) {
    throw new Error(`Unsupported file type: ${path.extname(filename)}`);
  }
  
  switch (fileType) {
    case 'pdf':
      return await extractTextFromPDF(filePath);
    case 'docx':
      return await extractTextFromDOCX(filePath);
    case 'txt':
      return await extractTextFromTXT(filePath);
    case 'doc':
      throw new Error('DOC files are not supported. Please convert to DOCX or PDF.');
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

module.exports = {
  extractTextFromFile,
  getFileType,
  extractTextFromPDF,
  extractTextFromDOCX,
  extractTextFromTXT
};

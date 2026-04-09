/**
 * cvParser.util.js
 * Responsible for extracting raw text from uploaded CV files (PDF, DOCX, TXT).
 */

const extractTextFromUploadedFile = async (file) => {
  if (!file || !file.buffer) return '';

  const filename = (file.originalname || '').toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();

  if (mimetype === 'text/plain' || filename.endsWith('.txt')) {
    return file.buffer.toString('utf8');
  }

  if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(file.buffer);
    return (parsed?.text || '').trim();
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return (result?.value || '').trim();
  }

  return '';
};

module.exports = { extractTextFromUploadedFile };

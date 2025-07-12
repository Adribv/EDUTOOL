const path = require('path');
const { exec } = require('child_process');

/**
 * Converts a .docx file to .pdf using LibreOffice in headless mode.
 * Returns a promise that resolves with the generated PDF file path.
 * Ensure LibreOffice is installed on the deployment server.
 * @param {string} inputPath absolute/relative path to the docx file
 * @returns {Promise<string>} path to generated PDF
 */
module.exports = function convertDocxToPdf(inputPath) {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(inputPath);
    const command = `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      const pdfPath = inputPath.replace(path.extname(inputPath), '.pdf');
      resolve(pdfPath);
    });
  });
}; 
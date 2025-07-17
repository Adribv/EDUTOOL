const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

class PDFGenerator {
  static async generateDisciplinaryFormPDF(formData, outputPath) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Generate HTML content
      const htmlContent = this.generateFormHTML(formData);
      
      // Set content and wait for it to load
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Generate PDF
      const pdf = await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      });
      
      return {
        success: true,
        path: outputPath,
        size: (await fs.stat(outputPath)).size
      };
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  static generateFormHTML(formData) {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const getMisconductTypes = () => {
      if (!formData.typeOfMisconduct) return 'N/A';
      
      const types = [];
      const labels = {
        disruptiveBehaviorInClass: 'Disruptive behavior in class',
        disrespectTowardStaff: 'Disrespect toward staff or students',
        physicalAggression: 'Physical aggression/fighting',
        inappropriateLanguage: 'Use of inappropriate language',
        bullyingHarassment: 'Bullying/harassment',
        vandalism: 'Vandalism/property damage',
        cheatingAcademicDishonesty: 'Cheating/academic dishonesty',
        skippingClassesWithoutPermission: 'Skipping classes without permission',
        other: 'Other'
      };
      
      Object.entries(formData.typeOfMisconduct).forEach(([key, value]) => {
        if (key !== 'otherDescription' && value) {
          const label = labels[key] || key;
          if (key === 'other' && formData.typeOfMisconduct.otherDescription) {
            types.push(`${label} (${formData.typeOfMisconduct.otherDescription})`);
          } else {
            types.push(label);
          }
        }
      });
      
      return types.length > 0 ? types.map(type => `<div class="checkbox-item">✓ ${type}</div>`).join('') : 'N/A';
    };
    
    const getActionsTaken = () => {
      if (!formData.actionTaken) return 'N/A';
      
      const actions = [];
      const labels = {
        verbalWarning: 'Verbal warning',
        writtenWarning: 'Written warning',
        parentNotification: 'Parent/guardian notified',
        counselingReferral: 'Counseling referral',
        detention: 'Detention',
        other: 'Other'
      };
      
      Object.entries(formData.actionTaken).forEach(([key, value]) => {
        if (key !== 'otherDescription' && key !== 'suspension' && value) {
          const label = labels[key] || key;
          if (key === 'other' && formData.actionTaken.otherDescription) {
            actions.push(`${label} (${formData.actionTaken.otherDescription})`);
          } else {
            actions.push(label);
          }
        }
      });
      
      if (formData.actionTaken.suspension?.selected) {
        actions.push(`Suspension (${formData.actionTaken.suspension.numberOfDays} days)`);
      }
      
      return actions.length > 0 ? actions.map(action => `<div class="checkbox-item">✓ ${action}</div>`).join('') : 'N/A';
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Disciplinary Form - ${formData.studentName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            line-height: 1.6; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #1976d2; 
            padding-bottom: 20px; 
          }
          .header h1 {
            color: #1976d2;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
          }
          .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #1976d2; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #1976d2; 
            padding-bottom: 8px; 
            text-transform: uppercase;
          }
          .field-row {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-start;
          }
          .field { 
            margin-bottom: 12px; 
            flex: 1;
            margin-right: 20px;
          }
          .field:last-child {
            margin-right: 0;
          }
          .field-label { 
            font-weight: bold; 
            color: #555; 
            display: block;
            margin-bottom: 3px;
          }
          .field-value {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
            background: #f9f9f9;
            min-height: 20px;
          }
          .description-field {
            margin-top: 10px;
          }
          .description-field .field-value {
            min-height: 80px;
            white-space: pre-wrap;
          }
          .checkbox-item { 
            margin: 8px 0; 
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
          }
          .checkbox-item:last-child {
            border-bottom: none;
          }
          .acknowledgment-section { 
            margin-top: 40px; 
            border-top: 2px solid #1976d2; 
            padding-top: 20px; 
          }
          .signature-area {
            border: 1px solid #ccc;
            height: 60px;
            margin-top: 10px;
            background: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
            font-style: italic;
            color: #666;
          }
          .footer { 
            margin-top: 40px; 
            border-top: 1px solid #ccc; 
            padding-top: 20px; 
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .two-column {
            display: flex;
            gap: 20px;
          }
          .two-column .field {
            margin-right: 0;
          }
          @media print { 
            body { margin: 20px; } 
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Student Disciplinary Action Form</h1>
          <div class="header-info">
            <div class="two-column">
              <div class="field">
                <span class="field-label">School:</span>
                <div class="field-value">${formData.schoolName || 'N/A'}</div>
              </div>
              <div class="field">
                <span class="field-label">Date:</span>
                <div class="field-value">${formatDate(formData.date)}</div>
              </div>
              <div class="field">
                <span class="field-label">Warning Number:</span>
                <div class="field-value">${formData.warningNumber || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Full Name:</span>
              <div class="field-value">${formData.studentName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Roll Number:</span>
              <div class="field-value">${formData.rollNumber || 'N/A'}</div>
            </div>
          </div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Grade/Class:</span>
              <div class="field-value">${formData.grade || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Section:</span>
              <div class="field-value">${formData.section || 'N/A'}</div>
            </div>
          </div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Parent/Guardian Name:</span>
              <div class="field-value">${formData.parentGuardianName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Contact Number:</span>
              <div class="field-value">${formData.contactNumber || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Incident Details</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Date of Incident:</span>
              <div class="field-value">${formatDate(formData.dateOfIncident)}</div>
            </div>
            <div class="field">
              <span class="field-label">Time of Incident:</span>
              <div class="field-value">${formData.timeOfIncident || 'N/A'}</div>
            </div>
          </div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Location:</span>
              <div class="field-value">${formData.location || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Reporting Staff Name:</span>
              <div class="field-value">${formData.reportingStaffName || formData.createdByName || 'N/A'}</div>
            </div>
          </div>
          <div class="description-field">
            <span class="field-label">Description of Incident:</span>
            <div class="field-value">${formData.descriptionOfIncident || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Type of Misconduct</div>
          ${getMisconductTypes()}
        </div>

        <div class="section">
          <div class="section-title">Action Taken</div>
          ${getActionsTaken()}
        </div>

        <div class="section">
          <div class="section-title">Reported By</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Name:</span>
              <div class="field-value">${formData.createdByName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Role:</span>
              <div class="field-value">${formData.createdByRole || 'N/A'}</div>
            </div>
          </div>
          <div class="field">
            <span class="field-label">Date Created:</span>
            <div class="field-value">${formatDate(formData.createdAt)}</div>
          </div>
        </div>

        ${formData.followUpRequired ? `
        <div class="section">
          <div class="section-title">Follow-up Information</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Follow-up Date:</span>
              <div class="field-value">${formatDate(formData.followUpDate)}</div>
            </div>
          </div>
          <div class="description-field">
            <span class="field-label">Follow-up Notes:</span>
            <div class="field-value">${formData.followUpNotes || 'N/A'}</div>
          </div>
        </div>
        ` : ''}

        <div class="acknowledgment-section">
          <div class="section-title">Student Acknowledgment</div>
          ${formData.studentAcknowledgment?.acknowledged ? `
            <div class="two-column">
              <div class="field">
                <span class="field-label">Acknowledged:</span>
                <div class="field-value">Yes</div>
              </div>
              <div class="field">
                <span class="field-label">Date:</span>
                <div class="field-value">${formatDate(formData.studentAcknowledgment.date)}</div>
              </div>
            </div>
            ${formData.studentAcknowledgment.comments ? `
            <div class="description-field">
              <span class="field-label">Student Comments:</span>
              <div class="field-value">${formData.studentAcknowledgment.comments}</div>
            </div>
            ` : ''}
          ` : `
            <div class="field">
              <span class="field-label">Student Signature:</span>
              <div class="signature-area">Signature Required</div>
            </div>
            <div class="field">
              <span class="field-label">Date:</span>
              <div class="signature-area">Date to be filled</div>
            </div>
          `}
        </div>

        <div class="acknowledgment-section">
          <div class="section-title">Parent/Guardian Acknowledgment</div>
          ${formData.parentAcknowledgment?.acknowledged ? `
            <div class="two-column">
              <div class="field">
                <span class="field-label">Acknowledged:</span>
                <div class="field-value">Yes</div>
              </div>
              <div class="field">
                <span class="field-label">Parent Name:</span>
                <div class="field-value">${formData.parentAcknowledgment.parentName || 'N/A'}</div>
              </div>
            </div>
            <div class="field">
              <span class="field-label">Date:</span>
              <div class="field-value">${formatDate(formData.parentAcknowledgment.date)}</div>
            </div>
            ${formData.parentAcknowledgment.comments ? `
            <div class="description-field">
              <span class="field-label">Parent Comments:</span>
              <div class="field-value">${formData.parentAcknowledgment.comments}</div>
            </div>
            ` : ''}
          ` : `
            <div class="field">
              <span class="field-label">Parent/Guardian Name:</span>
              <div class="signature-area">Name to be filled</div>
            </div>
            <div class="field">
              <span class="field-label">Parent/Guardian Signature:</span>
              <div class="signature-area">Signature Required</div>
            </div>
            <div class="field">
              <span class="field-label">Date:</span>
              <div class="signature-area">Date to be filled</div>
            </div>
          `}
        </div>

        <div class="footer">
          <p><strong>Important:</strong> This document was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>This is an official school document. Please keep a copy for your records.</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateTransportFormHTML(formData) {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const getRequestTypes = () => {
      if (!formData.requestType) return 'N/A';
      
      const types = [];
      const labels = {
        regularSchoolCommute: 'Regular School Commute',
        educationalTrip: 'Educational Trip',
        sportsEvent: 'Sports Event',
        culturalFieldVisit: 'Cultural/Field Visit',
        emergencyTransport: 'Emergency Transport',
        other: 'Other'
      };
      
      Object.entries(formData.requestType).forEach(([key, value]) => {
        if (key !== 'otherDescription' && value) {
          const label = labels[key] || key;
          if (key === 'other' && formData.requestType.otherDescription) {
            types.push(`${label} (${formData.requestType.otherDescription})`);
          } else {
            types.push(label);
          }
        }
      });
      
      return types.length > 0 ? types.map(type => `<div class="checkbox-item">✓ ${type}</div>`).join('') : 'N/A';
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transport Services Request Form - ${formData.studentFullName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; line-height: 1.6; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1976d2; padding-bottom: 20px; }
          .header h1 { color: #1976d2; margin: 0 0 10px 0; font-size: 28px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 18px; font-weight: bold; color: #1976d2; margin-bottom: 15px; border-bottom: 2px solid #1976d2; padding-bottom: 8px; text-transform: uppercase; }
          .field { margin-bottom: 12px; flex: 1; margin-right: 20px; }
          .field-label { font-weight: bold; color: #555; display: block; margin-bottom: 3px; }
          .field-value { padding: 8px; border: 1px solid #ddd; border-radius: 3px; background: #f9f9f9; min-height: 20px; }
          .two-column { display: flex; gap: 20px; }
          .checkbox-item { margin: 8px 0; padding: 5px 0; border-bottom: 1px dotted #ccc; }
          .signature-area { border: 1px solid #ccc; height: 60px; margin-top: 10px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; font-style: italic; color: #666; }
          .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transportation Services Request Form</h1>
        </div>

        <div class="section">
          <div class="section-title">School Details</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">School Name:</span>
              <div class="field-value">${formData.schoolName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Department/Class:</span>
              <div class="field-value">${formData.departmentClass || 'N/A'}</div>
            </div>
          </div>
          <div class="field">
            <span class="field-label">Date of Request:</span>
            <div class="field-value">${formatDate(formData.dateOfRequest)}</div>
          </div>
          <div class="field">
            <span class="field-label">Request Type:</span>
            <div class="field-value">${getRequestTypes()}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Student Full Name:</span>
              <div class="field-value">${formData.studentFullName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Grade/Class & Section:</span>
              <div class="field-value">${formData.gradeClassSection || 'N/A'}</div>
            </div>
          </div>
          <div class="field">
            <span class="field-label">Roll Number:</span>
            <div class="field-value">${formData.rollNumber || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Parent/Guardian Information</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Name:</span>
              <div class="field-value">${formData.parentGuardianName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Contact Number:</span>
              <div class="field-value">${formData.contactNumber || 'N/A'}</div>
            </div>
          </div>
          <div class="field">
            <span class="field-label">Address (Pickup/Drop):</span>
            <div class="field-value">${formData.pickupDropAddress || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Transport Details</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Pickup Location:</span>
              <div class="field-value">${formData.pickupLocation || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Drop Location:</span>
              <div class="field-value">${formData.dropLocation || 'N/A'}</div>
            </div>
          </div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Date(s) Required:</span>
              <div class="field-value">${formatDate(formData.dateRequiredFrom)} to ${formatDate(formData.dateRequiredTo)}</div>
            </div>
            <div class="field">
              <span class="field-label">Trip Type:</span>
              <div class="field-value">${formData.tripType === 'one-way' ? 'One-way' : 'Round-trip'}</div>
            </div>
          </div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Pickup Time:</span>
              <div class="field-value">${formData.pickupTime || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Drop Time:</span>
              <div class="field-value">${formData.dropTime || 'N/A'}</div>
            </div>
          </div>
          <div class="field">
            <span class="field-label">Number of Students:</span>
            <div class="field-value">${formData.numberOfStudents || 1}</div>
          </div>
          <div class="field">
            <span class="field-label">Purpose of Transportation:</span>
            <div class="field-value">${formData.purposeOfTransportation || 'N/A'}</div>
          </div>
          ${formData.specialInstructions ? `
          <div class="field">
            <span class="field-label">Special Instructions:</span>
            <div class="field-value">${formData.specialInstructions}</div>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Signatures</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Parent/Guardian Name:</span>
              <div class="field-value">${formData.parentGuardianName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Date:</span>
              <div class="field-value">${formData.parentSignatureDate ? formatDate(formData.parentSignatureDate) : 'N/A'}</div>
            </div>
          </div>
          <div class="field">
            <span class="field-label">Parent/Guardian Signature:</span>
            ${formData.parentSignature ? 
              `<div class="field-value"><img src="data:image/png;base64,${formData.parentSignature}" style="max-width: 200px; max-height: 60px;" /></div>` :
              `<div class="signature-area">Signature Required</div>`
            }
          </div>
        </div>

        <div class="section">
          <div class="section-title">School Transport Coordinator Approval</div>
          <div class="two-column">
            <div class="field">
              <span class="field-label">Coordinator Name:</span>
              <div class="field-value">${formData.coordinatorName || 'N/A'}</div>
            </div>
            <div class="field">
              <span class="field-label">Date:</span>
              <div class="field-value">${formData.coordinatorSignatureDate ? formatDate(formData.coordinatorSignatureDate) : 'N/A'}</div>
            </div>
          </div>
          <div class="field">
            <span class="field-label">Coordinator Signature:</span>
            ${formData.coordinatorSignature ? 
              `<div class="field-value"><img src="data:image/png;base64,${formData.coordinatorSignature}" style="max-width: 200px; max-height: 60px;" /></div>` :
              `<div class="signature-area">Signature Required</div>`
            }
          </div>
        </div>

        <div class="footer">
          <p><strong>Important:</strong> This document was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>This is an official school document. Please keep a copy for your records.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate Transport Form PDF
  static async generateTransportFormPDF(formData, outputPath) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Generate HTML content
      const htmlContent = this.generateTransportFormHTML(formData);
      
      // Set content and wait for it to load
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Generate PDF
      const pdf = await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      });
      
      return {
        success: true,
        path: outputPath,
        size: (await fs.stat(outputPath)).size
      };
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = PDFGenerator; 
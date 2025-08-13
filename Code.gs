/**
 * Queendom Consultancy - Form Submission Handler
 * Google Apps Script backend for processing intake form submissions
 */

// Service pricing configuration
const SERVICE_FEES = {
  'Standard Consulting Fee': 100,
  'CPA Referral Coordination': 150,
  'Bookkeeping Referral Coordination': 120,
  'Grant Submission': 200,
  'Business Plan Writing': 250,
  'Nonprofit Formation': 300
};

// Spreadsheet configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with actual spreadsheet ID
const SHEET_NAME = 'Form Submissions';

/**
 * Main function to handle form submissions
 * This function should be deployed as a web app
 */
function doPost(e) {
  try {
    // Parse form data
    const formData = parseFormData(e);
    
    // Process the submission
    const result = processFormSubmission(formData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        totalFee: result.totalFee,
        submissionId: result.submissionId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error processing form submission: ' + error.toString());
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error processing form submission',
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Parse incoming form data
 */
function parseFormData(e) {
  const parameter = e.parameter;
  
  // Extract basic form fields
  const formData = {
    fullName: parameter['Full Name'] || '',
    email: parameter['Email'] || '',
    businessName: parameter['Business Name'] || '',
    additionalNotes: parameter['Additional Notes'] || '',
    timestamp: new Date(),
    // Handle multiple service selections
    servicesRequested: []
  };
  
  // Parse services requested (handle both single and multiple selections)
  if (parameter['Service Requested[]']) {
    // If multiple services are selected, parameter will be an array
    if (Array.isArray(parameter['Service Requested[]'])) {
      formData.servicesRequested = parameter['Service Requested[]'];
    } else {
      // Single service selected
      formData.servicesRequested = [parameter['Service Requested[]']];
    }
  }
  
  return formData;
}

/**
 * Process form submission and save to spreadsheet
 */
function processFormSubmission(formData) {
  // Calculate total fee
  const totalFee = calculateTotalFee(formData.servicesRequested);
  
  // Get or create spreadsheet
  const sheet = getOrCreateSheet();
  
  // Prepare row data
  const rowData = prepareRowData(formData, totalFee);
  
  // Add to spreadsheet
  sheet.appendRow(rowData);
  
  // Generate submission ID (timestamp + random)
  const submissionId = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHHmmss') + 
                      Math.floor(Math.random() * 1000);
  
  // Send confirmation email (optional)
  sendConfirmationEmail(formData, totalFee, submissionId);
  
  return {
    totalFee: totalFee,
    submissionId: submissionId
  };
}

/**
 * Calculate total fee based on selected services
 */
function calculateTotalFee(servicesRequested) {
  let total = 0;
  
  servicesRequested.forEach(service => {
    if (SERVICE_FEES[service]) {
      total += SERVICE_FEES[service];
    }
  });
  
  return total;
}

/**
 * Get or create the spreadsheet and sheet
 */
function getOrCreateSheet() {
  let spreadsheet;
  
  try {
    // Try to open existing spreadsheet
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    // Create new spreadsheet if ID doesn't exist
    spreadsheet = SpreadsheetApp.create('Queendom Consultancy - Form Submissions');
    Logger.log('Created new spreadsheet with ID: ' + spreadsheet.getId());
  }
  
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // Set up headers
    const headers = [
      'Timestamp',
      'Full Name',
      'Email',
      'Business Name',
      'Additional Notes',
      // Yes/No columns for each service
      'Standard Consulting Fee',
      'CPA Referral Coordination',
      'Bookkeeping Referral Coordination',
      'Grant Submission',
      'Business Plan Writing',
      'Nonprofit Formation',
      'Total Fee ($)',
      'Services Summary'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#FFD700');
    headerRange.setFontWeight('bold');
    headerRange.setFontColor('#000000');
  }
  
  return sheet;
}

/**
 * Prepare row data for spreadsheet insertion
 */
function prepareRowData(formData, totalFee) {
  const serviceKeys = Object.keys(SERVICE_FEES);
  
  // Create Yes/No values for each service
  const serviceColumns = serviceKeys.map(service => 
    formData.servicesRequested.includes(service) ? 'Yes' : 'No'
  );
  
  // Create services summary
  const servicesSummary = formData.servicesRequested.length > 0 
    ? formData.servicesRequested.join(', ')
    : 'None selected';
  
  return [
    formData.timestamp,
    formData.fullName,
    formData.email,
    formData.businessName,
    formData.additionalNotes,
    ...serviceColumns,
    totalFee,
    servicesSummary
  ];
}

/**
 * Send confirmation email to client
 */
function sendConfirmationEmail(formData, totalFee, submissionId) {
  if (!formData.email) return;
  
  const subject = 'Queendom Consultancy - Form Submission Received';
  
  const body = `
Dear ${formData.fullName},

Thank you for your interest in Queendom Consultancy. We have received your intake form submission.

Submission Details:
- Submission ID: ${submissionId}
- Services Requested: ${formData.servicesRequested.join(', ') || 'None selected'}
- Estimated Total Fee: $${totalFee}

We will review your submission and contact you shortly to discuss next steps.

Best regards,
Queendom Consultancy Team

---
This is an automated confirmation email. Please do not reply to this message.
  `;
  
  try {
    MailApp.sendEmail(formData.email, subject, body);
    Logger.log('Confirmation email sent to: ' + formData.email);
  } catch (error) {
    Logger.log('Error sending confirmation email: ' + error.toString());
  }
}

/**
 * Test function for development
 */
function testFormSubmission() {
  const testData = {
    parameter: {
      'Full Name': 'Test User',
      'Email': 'test@example.com',
      'Business Name': 'Test Business',
      'Service Requested[]': ['Standard Consulting Fee', 'Grant Submission'],
      'Additional Notes': 'This is a test submission'
    }
  };
  
  const result = doPost(testData);
  Logger.log('Test result: ' + result.getContent());
}

/**
 * Setup function to initialize the script
 */
function setup() {
  // Create initial spreadsheet structure
  const sheet = getOrCreateSheet();
  Logger.log('Setup complete. Spreadsheet ID: ' + sheet.getParent().getId());
  
  // Log the web app URL instructions
  Logger.log('To deploy as web app:');
  Logger.log('1. Go to Deploy > New Deployment');
  Logger.log('2. Choose "Web app" as type');
  Logger.log('3. Set execute as "Me" and access to "Anyone"');
  Logger.log('4. Copy the web app URL and use it as form action');
}
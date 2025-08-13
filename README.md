# Queendom Consultancy - Google Apps Script Backend Setup

## Overview

This repository contains the backend logic for processing form submissions from the Queendom Consultancy intake forms. The backend is implemented as a Google Apps Script that:

- Accepts multiple service selections from the form
- Calculates total fees based on service pricing
- Stores submissions in a Google Spreadsheet with Yes/No columns for each service
- Sends confirmation emails to clients
- Provides detailed tracking and reporting

## Service Pricing

The following services are supported with their respective fees:

- **Standard Consulting Fee**: $100
- **CPA Referral Coordination**: $150
- **Bookkeeping Referral Coordination**: $120
- **Grant Submission**: $200
- **Business Plan Writing**: $250
- **Nonprofit Formation**: $300

## Files

### Code.gs
Contains the Google Apps Script backend logic with the following main functions:

- `doPost(e)` - Main form submission handler (deployed as web app)
- `processFormSubmission(formData)` - Processes and stores form data
- `calculateTotalFee(servicesRequested)` - Calculates total fee from selected services
- `sendConfirmationEmail(formData, totalFee, submissionId)` - Sends confirmation email to client

### HTML Forms
- **intake.html** - Main intake form (accessible via /intake redirect)
- **intake-form.html** - Alternative intake form with logo and styling

Both forms include:
- Service selection with multiple choice support
- Automatic fee calculation
- Form validation
- Visual pricing display
- Responsive design

## Setup Instructions

### 1. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace the default code with the contents of `Code.gs`
4. Update the `SPREADSHEET_ID` constant with your Google Spreadsheet ID
5. Save the project

### 2. Deploy as Web App

1. In Google Apps Script, click **Deploy** > **New Deployment**
2. Choose **Web app** as the deployment type
3. Set **Execute as**: "Me"
4. Set **Who has access**: "Anyone" (for public form submissions)
5. Click **Deploy**
6. Copy the web app URL

### 3. Update Form Actions

1. In both `intake.html` and `intake-form.html`, replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your web app URL
2. Remove the test JavaScript and enable actual form submission

Example:
```html
<form id="intakeForm" name="queendom-intake" method="POST" action="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec">
```

### 4. Google Spreadsheet Structure

The script automatically creates a spreadsheet with the following columns:

| Column | Description |
|--------|-------------|
| Timestamp | When the form was submitted |
| Full Name | Client's full name |
| Email | Client's email address |
| Business Name | Client's business name |
| Additional Notes | Any additional information provided |
| Standard Consulting Fee | Yes/No if this service was selected |
| CPA Referral Coordination | Yes/No if this service was selected |
| Bookkeeping Referral Coordination | Yes/No if this service was selected |
| Grant Submission | Yes/No if this service was selected |
| Business Plan Writing | Yes/No if this service was selected |
| Nonprofit Formation | Yes/No if this service was selected |
| Total Fee ($) | Calculated total fee for selected services |
| Services Summary | Comma-separated list of selected services |

## Form Field Structure

The forms expect the following field names:

- `Full Name` - Client's full name (required)
- `Email` - Client's email address (required)
- `Business Name` - Client's business name (optional)
- `Service Requested[]` - Array of selected services (required)
- `Additional Notes` - Additional information (optional)

## Testing

To test the setup:

1. Use the `testFormSubmission()` function in Google Apps Script
2. Run the function from the Apps Script editor
3. Check the execution log for results
4. Verify data appears in the spreadsheet

## Security Considerations

- The web app is set to "Anyone" access for public form submissions
- Form data is validated and sanitized before processing
- Error handling prevents data corruption
- Email notifications are sent securely through Google's infrastructure

## Customization

### Adding New Services

1. Update the `SERVICE_FEES` object in `Code.gs`
2. Add corresponding options to the HTML forms
3. Update the spreadsheet headers in `getOrCreateSheet()`

### Modifying Email Templates

Edit the `sendConfirmationEmail()` function to customize:
- Email subject line
- Email body content
- Sender information

### Changing Spreadsheet Structure

Modify the `prepareRowData()` and `getOrCreateSheet()` functions to:
- Add new columns
- Change data formatting
- Adjust column ordering

## Troubleshooting

### Common Issues

1. **Form submissions not appearing**: Check that the web app URL is correct and the script has proper permissions
2. **Email notifications not sending**: Verify that the MailApp service has necessary permissions
3. **Spreadsheet not found**: Update the `SPREADSHEET_ID` constant or let the script create a new one

### Debugging

1. Check the Google Apps Script execution logs
2. Use the `testFormSubmission()` function for debugging
3. Verify form field names match expected values
4. Ensure proper JSON structure in form submissions

## Support

For technical support or customization requests, contact the development team.
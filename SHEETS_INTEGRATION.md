# Google Sheets Integration Guide

## Overview
This guide explains how to integrate your Google Sheets with the Acharya108 Recitation App. The integration allows you to:
- Load questions dynamically from Google Sheets
- Manage evaluation rubrics
- Track student progress
- Update content without modifying code

## 📊 Your Google Sheet
**Sheet ID:** `19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo`

**Sheet URL:** [Open in Google Sheets](https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/edit)

## 🛠️ Setup Instructions

### Step 1: Publish Your Sheets to Web

1. **Open your Google Sheet**
   - Go to: https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/edit

2. **Publish to Web**
   - Click **File** → **Share** → **Publish to web**
   - For **each of the 3 sheets** (Questions, Rubrics, Progress):
     - Select the sheet tab from dropdown
     - Choose **"Comma-separated values (.csv)"** format
     - Click **Publish**
   - Click **OK** to confirm

3. **Verify GID Numbers**
   - Click on each sheet tab
   - Look at the URL: `...#gid=XXXXXXXX`
   - Note the GID number for each sheet

### Step 2: Update GID Numbers (if needed)

If your sheet GIDs are different from the defaults (0, 1, 2), update `sheets-integration.js`:

```javascript
this.SHEET_GIDS = {
    questions: '0',        // Update this
    rubrics: '1',          // Update this
    progress: '2'          // Update this
};
```

### Step 3: Test the Integration

1. Open `sheets-demo.html` in your browser
2. Click **Load All Sheets** button
3. Verify data loads successfully
4. Test other buttons to explore the data

## 📝 Sheet Structure

### Sheet 1: Questions

Required columns:
- **ID**: Unique identifier (e.g., q1, q2, q3)
- **Grade**: Grade level (6-12)
- **Subject**: Subject name (science, social, tamil, english)
- **Lesson**: Lesson number (1, 2, 3, etc.)
- **Type**: Question type (brief, detailed)
- **Question**: The actual question text
- **BasicAnswer**: Basic level answer
- **ElementaryAnswer**: Elementary level answer
- **IntermediateAnswer**: Intermediate level answer
- **AdvancedAnswer**: Advanced level answer
- **ExpertAnswer**: Expert level answer
- **Keywords**: Comma-separated keywords

**Example:**
```csv
ID,Grade,Subject,Lesson,Type,Question,BasicAnswer,ElementaryAnswer,...,Keywords
q1,10,science,1,brief,"Define inertia","Inertia is...","Inertia is the property...","inertia,rest,motion"
```

### Sheet 2: Rubrics

Required columns:
- **QuestionID**: Matches ID from Questions sheet
- **Concept**: Name of the concept being evaluated
- **Description**: Detailed description
- **MaxPoints**: Maximum points for this concept
- **Keywords**: Comma-separated keywords to look for
- **Importance**: Importance level (high, medium, low)

**Example:**
```csv
QuestionID,Concept,Description,MaxPoints,Keywords,Importance
q1,"Definition","Clear definition of inertia",10,"property,resist,change",high
q1,"Classification","Mentions three types",10,"rest,motion,direction",high
```

### Sheet 3: Student Progress

Required columns:
- **StudentID**: Unique student identifier
- **QuestionID**: Question ID from Questions sheet
- **Attempt**: Attempt number (1, 2, 3, etc.)
- **Score**: Score achieved (0-100)
- **Timestamp**: Date and time of attempt
- **Response**: Student's answer text

**Example:**
```csv
StudentID,QuestionID,Attempt,Score,Timestamp,Response
student123,q1,1,85,2026-01-01T10:30:00Z,"Inertia is the property..."
```

## 💻 Using the Integration in Your App

### Initialize
```javascript
// Include the script in your HTML
<script src="sheets-integration.js"></script>

// Create instance
const sheetsAPI = new SheetsIntegration();
```

### Load All Data
```javascript
// Load all sheets (cached for 5 minutes)
const data = await sheetsAPI.loadAllSheets();

console.log('Questions:', data.questions.all);
console.log('Rubrics:', data.rubrics);
console.log('Progress:', data.progress.all);
```

### Get Questions
```javascript
// Get questions for Grade 10, Science, Lesson 1
const questions = await sheetsAPI.getQuestions(10, 'science', 1);

// Get a specific question
const question = await sheetsAPI.getQuestion('q1');
// or by text:
const question = await sheetsAPI.getQuestion('Define inertia');
```

### Get Answers
```javascript
// Get answer at specific level
const basicAnswer = await sheetsAPI.getAnswer('q1', 'basic');
const expertAnswer = await sheetsAPI.getAnswer('q1', 'expert');
```

### Get Rubrics
```javascript
// Get rubric for evaluation
const rubric = await sheetsAPI.getRubric('q1');
// Returns array of rubric items with concepts, keywords, max points
```

### Get Student Progress
```javascript
// Get progress for a specific student
const progress = await sheetsAPI.getStudentProgress('student123');
```

### Cache Management
```javascript
// Check cache status
const status = sheetsAPI.getStatus();
console.log('Is cached:', status.isCached);
console.log('Last updated:', status.lastUpdated);

// Clear cache to force refresh
sheetsAPI.clearCache();
```

## ✨ Features

### 📦 Automatic Caching
- Data is cached for 5 minutes
- Reduces API calls
- Faster subsequent loads

### 🔍 Smart Indexing
- Questions indexed by grade, subject, lesson
- Fast lookups by ID or text
- Efficient filtering

### 🔄 CSV Parsing
- Handles quoted values
- Processes commas in text
- Robust error handling

### 📊 Status Tracking
- Loading states
- Error reporting
- Cache information

## 🛡️ Troubleshooting

### Error: "Failed to fetch"
**Solution:**
1. Make sure sheet is published to web
2. Check that GID numbers are correct
3. Verify sheet has public access

### Error: "Empty response received"
**Solution:**
1. Confirm sheet has data
2. Check column headers match expected names
3. Ensure CSV format is selected when publishing

### No questions appear
**Solution:**
1. Verify data exists in Questions sheet
2. Check Grade, Subject, Lesson values match your query
3. Look for typos in subject names (must be lowercase)

### CORS errors
**Solution:**
1. Sheets must be published to web (not just shared)
2. Use the CSV export URL format
3. Test in different browser if needed

## 🔒 Security Notes

- **Published sheets are public** - Don't include sensitive data
- **Read-only** - This integration only reads data
- **No authentication** - Anyone with the link can access
- For write operations, you'll need Google Apps Script (see next section)

## 📝 Writing Data (Optional)

To save student progress back to Google Sheets:

1. **Create Google Apps Script**
   - Open your sheet
   - Extensions → Apps Script
   - Paste this code:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Student Progress');
    
    sheet.appendRow([
      data.studentId,
      data.questionId,
      data.attempt,
      data.score,
      data.timestamp,
      data.response
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({status: 'success'})
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({status: 'error', message: error.toString()})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

2. **Deploy as Web App**
   - Click Deploy → New deployment
   - Select "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click Deploy
   - Copy the Web App URL

3. **Update your app** to use the URL for saving progress

## 📚 Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Apps Script Documentation](https://developers.google.com/apps-script)
- [CSV Format Specification](https://tools.ietf.org/html/rfc4180)

## 👤 Support

If you encounter issues:
1. Check the browser console for detailed errors
2. Verify your sheet structure matches the documentation
3. Test with `sheets-demo.html` first
4. Review the troubleshooting section above

---

**Last Updated:** January 2026
**Version:** 1.0

# 📚 Google Sheets Setup Guide

## Your Google Sheet

**Sheet ID:** `19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo`

**Direct Link:** [Open your Google Sheet](https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/edit)

---

## 🔑 Step 1: Make Your Sheet Accessible

Since the "Publish to web" option isn't available, we'll use the public sharing method:

### Option A: Using Share Settings (Recommended)

1. **Open your Google Sheet** (link above)

2. **Click the Share button** (top right corner)

3. **Change access level:**
   - Click "Change to anyone with the link"
   - Set permission to **"Viewer"**
   - Click **"Done"**

4. **Verify it works:**
   - Open this URL in a new browser tab (replace with your actual GIDs if needed):
   ```
   https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/export?format=csv&gid=0
   ```
   - You should see CSV data download or display

### Option B: If "Publish to web" is available

1. Click **File** → **Share** → **Publish to web**
2. Select each sheet tab and publish as CSV
3. Click Publish

---

## 📋 Step 2: Verify Your Sheet Structure

### Sheet 1: Questions

Your sheet should have these columns (exact header names):

```
global_question_id | question_code | board | medium | grade | subject | lesson_no | question_no | question_text | lesson_id
```

**Example data:**
```csv
global_question_id,question_code,board,medium,grade,subject,lesson_no,question_no,question_text,lesson_id
q_science_10_1_1,SCI-10-1-1,tn,english,10,science,1,1,"What is inertia?",lesson_sci_10_1
q_science_10_1_2,SCI-10-1-2,tn,english,10,science,1,2,"State Newton's first law",lesson_sci_10_1
```

**Important Notes:**
- `global_question_id`: Unique identifier for each question
- `grade`: Must be a number (6, 7, 8, 9, 10, 11, 12)
- `subject`: Lowercase (science, social, tamil, english, maths)
- `board`: Board name (tn, cbse, icse)
- `medium`: Language (english, tamil)
- `lesson_id`: Links to the Lessons sheet

---

### Sheet 2: Lessons

Your sheet should have these columns:

```
lesson_id | lesson_name | lesson_doc_id
```

**Example data:**
```csv
lesson_id,lesson_name,lesson_doc_id
lesson_sci_10_1,"Laws of Motion",doc_123456
lesson_sci_10_2,"Gravitation",doc_123457
```

**Important Notes:**
- `lesson_id`: Must match the `lesson_id` in Questions sheet
- `lesson_name`: Display name of the lesson
- `lesson_doc_id`: Optional document reference

---

### Sheet 3: Master Answer

Your sheet should have these columns:

```
global_question_id | level_basic | level_elementary | level_intermediate | level_advanced | level_prodigy
```

**Example data:**
```csv
global_question_id,level_basic,level_elementary,level_intermediate,level_advanced,level_prodigy
q_science_10_1_1,"Inertia is the property of matter","Inertia is the tendency of objects to resist changes in their state of motion","Inertia is a fundamental property where objects maintain their state of rest or uniform motion unless acted upon by external force","Inertia is the inherent property of matter quantified by mass, where greater mass indicates greater resistance to changes in velocity as described by Newton's First Law","Inertia represents the fundamental principle of conservation of momentum in the absence of external forces, mathematically expressed as F=ma, where the acceleration is inversely proportional to mass, demonstrating the relationship between force, mass, and motion in classical mechanics"
```

**Important Notes:**
- `global_question_id`: Must match the `global_question_id` in Questions sheet
- Answer levels progress from simple to complex:
  - **basic**: Short, simple answer (1-2 sentences)
  - **elementary**: Moderate detail (2-3 sentences)
  - **intermediate**: Good understanding (3-4 sentences)
  - **advanced**: Deep understanding (4-5 sentences)
  - **prodigy**: Expert level with technical details (5+ sentences)

---

## 🔍 Step 3: Find Your Sheet GIDs

Each sheet tab has a unique GID number that we need:

1. **Click on the "Questions" tab** (Sheet 1)
   - Look at the URL: `...#gid=XXXXXXXX`
   - Copy the number after `gid=`
   - This is likely `0` for the first sheet

2. **Click on the "Lessons" tab** (Sheet 2)
   - Note the GID number
   - This is likely `1` or a different number

3. **Click on the "Master Answer" tab** (Sheet 3)
   - Note the GID number
   - This is likely `2` or a different number

4. **Update `sheets-integration.js` if needed:**
   ```javascript
   this.SHEET_GIDS = {
       questions: '0',        // Replace with your Questions GID
       lessons: '1234567',    // Replace with your Lessons GID
       answers: '7654321'     // Replace with your Master Answer GID
   };
   ```

---

## ✅ Step 4: Test the Integration

1. **Open the demo page:**
   - If hosted: Open `sheets-demo.html` in your browser
   - Or create a simple HTML file with:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Sheets Integration</title>
</head>
<body>
    <h1>Testing Google Sheets Integration</h1>
    <button onclick="testLoad()">Load Data</button>
    <div id="result"></div>

    <script src="sheets-integration.js"></script>
    <script>
        const sheetsAPI = new SheetsIntegration();

        async function testLoad() {
            try {
                console.log('Loading sheets...');
                const data = await sheetsAPI.loadAllSheets();
                
                document.getElementById('result').innerHTML = `
                    <h2>✅ Success!</h2>
                    <p>Questions: ${data.merged.all.length}</p>
                    <p>Lessons: ${data.lessons.all.length}</p>
                    <p>Answers: ${data.answers.all.length}</p>
                `;
                
                console.log('Sample question:', data.merged.all[0]);
            } catch (error) {
                document.getElementById('result').innerHTML = `
                    <h2>❌ Error</h2>
                    <p>${error.message}</p>
                `;
                console.error(error);
            }
        }
    </script>
</body>
</html>
```

2. **Click "Load Data" button**

3. **Check browser console** (F12) for detailed logs

---

## 🛠️ Common Issues & Solutions

### Issue 1: "Failed to fetch" error

**Solution:**
- Make sure sheet is shared as "Anyone with the link can view"
- Check that GID numbers are correct
- Try opening the CSV URL directly in browser

### Issue 2: "Empty response received"

**Solution:**
- Verify your sheets have data
- Check column headers match exactly (case-sensitive)
- Make sure there are no empty sheets

### Issue 3: CORS errors

**Solution:**
- Must use the `/export?format=csv` URL format
- Sheet must be publicly accessible
- Try in different browser (Chrome/Firefox)

### Issue 4: Data not loading

**Solution:**
- Open browser console (F12) and check for errors
- Verify GID numbers are correct
- Test CSV URL directly: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0`

### Issue 5: Questions don't have answers

**Solution:**
- Make sure `global_question_id` matches exactly between Questions and Master Answer sheets
- Check for typos or extra spaces
- IDs are case-sensitive

---

## 💻 Using in Your App

### Basic Usage

```javascript
// Initialize
const sheetsAPI = new SheetsIntegration();

// Load all data
const data = await sheetsAPI.loadAllSheets();

// Get questions for Grade 10, Science, Lesson 1
const questions = await sheetsAPI.getQuestions(10, 'science', 1);

// Get a specific question with all its answers
const question = await sheetsAPI.getQuestion('q_science_10_1_1');
console.log(question.questionText);
console.log(question.answers.basic);
console.log(question.answers.prodigy);

// Get specific answer level
const answer = await sheetsAPI.getAnswer('q_science_10_1_1', 'advanced');

// Get lesson info
const lesson = await sheetsAPI.getLesson('lesson_sci_10_1');
console.log(lesson.lessonName);
```

### Advanced Usage

```javascript
// Get all questions for a grade
const grade10Questions = await sheetsAPI.getQuestions(10);

// Get all science questions
const scienceQuestions = await sheetsAPI.getQuestions(null, 'science');

// Get all lessons
const allLessons = await sheetsAPI.getAllLessons();

// Check cache status
const status = sheetsAPI.getStatus();
console.log('Cached:', status.isCached);
console.log('Last updated:', status.lastUpdated);

// Clear cache to force refresh
sheetsAPI.clearCache();
```

---

## 🔒 Security Notes

- ✅ **Read-only access**: The integration only reads data
- ⚠️ **Public data**: Anyone with the link can access your sheet
- ❌ **Don't store**: Passwords, personal info, or sensitive data
- ✅ **Safe for**: Questions, answers, lesson content

---

## 📊 Data Flow

```
Google Sheets
    ↓
    ├── Questions Sheet → Parsed → Indexed by grade/subject/lesson
    ├── Lessons Sheet → Parsed → Indexed by lesson_id
    └── Master Answer Sheet → Parsed → Indexed by global_question_id
                ↓
        Merged Data (Questions + Answers + Lesson Info)
                ↓
            Cached for 5 minutes
                ↓
          Your App Uses It!
```

---

## 🎯 Next Steps

1. ✅ Set up public sharing on your Google Sheet
2. ✅ Verify GID numbers and update if needed
3. ✅ Test with the demo HTML file
4. ✅ Start using in your Recitation App!

---

**Need Help?**
- Check browser console for detailed error messages
- Verify your sheet structure matches this guide
- Test CSV export URLs directly in browser

**Last Updated:** January 2026

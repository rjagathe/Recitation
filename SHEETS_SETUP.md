# Google Sheets Setup Guide

## 📊 Your Current Sheet Structure

**Sheet ID:** `19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo`

### Your 3 Sheets:

1. **Questions** - All question metadata
2. **Lesson** - Lesson information
3. **Master Answer** - Answers at different difficulty levels

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Make Your Sheet Public

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/edit

2. Click the **Share** button (top right corner)

3. Click **"Change to anyone with the link"**

4. Set permission to **"Viewer"**

5. Click **"Done"**

### Step 2: Find Your Sheet GIDs

1. Click on each sheet tab at the bottom
2. Look at the URL in your browser
3. Find the `gid=` number

**Example URL:**
```
https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/edit#gid=0
                                                                                              ^
                                                                                           This is the GID
```

**Your GIDs:**
- Questions sheet: `gid=______` (write it down)
- Lesson sheet: `gid=______` (write it down)
- Master Answer sheet: `gid=______` (write it down)

### Step 3: Update GIDs in Code (if needed)

If your GIDs are NOT 0, 1, 2, update `sheets-integration.js`:

```javascript
this.SHEET_GIDS = {
    questions: '0',     // Replace with your Questions sheet GID
    lessons: '1234',    // Replace with your Lesson sheet GID
    answers: '5678'     // Replace with your Master Answer sheet GID
};
```

---

## 📝 Your Sheet Structures

### Sheet 1: Questions

**Required Columns:**
```
global_question_id | question_code | board | medium | grade | subject | lesson_no | question_no | question_text | lesson_id
```

**Example Data:**
```csv
global_question_id,question_code,board,medium,grade,subject,lesson_no,question_no,question_text,lesson_id
Q001,TN10SCI01,tn,english,10,science,1,1,"Define inertia. Give its classification.",L001
Q002,TN10SCI01,tn,english,10,science,1,2,"State Newton's first law of motion.",L001
```

**Field Descriptions:**
- `global_question_id`: Unique ID (e.g., Q001, Q002)
- `question_code`: Course/board code
- `board`: Board name (tn, cbse)
- `medium`: Language medium (english, tamil)
- `grade`: Grade level (6-12)
- `subject`: Subject name (science, social, tamil, english)
- `lesson_no`: Lesson number (1, 2, 3...)
- `question_no`: Question number within lesson
- `question_text`: The actual question
- `lesson_id`: References Lesson sheet

### Sheet 2: Lesson

**Required Columns:**
```
lesson_id | lesson_name | lesson_doc_id
```

**Example Data:**
```csv
lesson_id,lesson_name,lesson_doc_id
L001,Laws of Motion,DOC001
L002,Gravitation,DOC002
```

**Field Descriptions:**
- `lesson_id`: Unique lesson ID (L001, L002)
- `lesson_name`: Display name of lesson
- `lesson_doc_id`: Optional document reference

### Sheet 3: Master Answer

**Required Columns:**
```
global_question_id | level_basic | level_elementary | level_intermediate | level_advanced | level_prodigy
```

**Example Data:**
```csv
global_question_id,level_basic,level_elementary,level_intermediate,level_advanced,level_prodigy
Q001,"Inertia is resistance to change in motion.","Inertia is the property of matter...","Inertia quantifies...","Inertia, as defined by...","From a relativistic perspective..."
```

**Field Descriptions:**
- `global_question_id`: Matches Questions sheet
- `level_basic`: Simple, 1-2 sentence answer
- `level_elementary`: Detailed explanation with examples
- `level_intermediate`: Technical explanation with formulas
- `level_advanced`: In-depth with derivations
- `level_prodigy`: Expert-level with advanced concepts

---

## 💻 Testing Your Integration

### Test URL Format

Your sheets will be accessible via these URLs:

```
Questions:
https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/export?format=csv&gid=0

Lesson:
https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/export?format=csv&gid=1

Master Answer:
https://docs.google.com/spreadsheets/d/19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo/export?format=csv&gid=2
```

### Test in Browser

1. Copy any URL above
2. Paste in browser address bar
3. You should see CSV data download or display
4. If you get an error, check that sheet is public

### Test with Demo Page

Open `sheets-demo.html` and click "Load All Sheets"

---

## 🔧 Using in Your App

### Initialize
```javascript
// Include in your HTML
<script src="sheets-integration.js"></script>

// Create instance
const sheetsAPI = new SheetsIntegration();
```

### Load Questions
```javascript
// Get questions for Grade 10, Science, Lesson 1
const questions = await sheetsAPI.getQuestions(10, 'science', 1);

console.log('Questions:', questions);
// Each question has: globalQuestionId, questionText, lessonName, answers{}
```

### Get Specific Question
```javascript
// By ID
const q = await sheetsAPI.getQuestion('Q001');

// By text
const q = await sheetsAPI.getQuestion('Define inertia');

console.log('Question:', q.questionText);
console.log('Lesson:', q.lessonName);
```

### Get Answers
```javascript
// Get answer at specific level
const basicAnswer = await sheetsAPI.getAnswer('Q001', 'basic');
const prodigyAnswer = await sheetsAPI.getAnswer('Q001', 'prodigy');

// Question object already has answers merged
const q = await sheetsAPI.getQuestion('Q001');
console.log(q.answers.basic);        // Basic level
console.log(q.answers.elementary);   // Elementary level
console.log(q.answers.intermediate); // Intermediate level
console.log(q.answers.advanced);     // Advanced level
console.log(q.answers.prodigy);      // Prodigy level
```

### Get Lessons
```javascript
// Get all lessons
const lessons = await sheetsAPI.getAllLessons();

// Get specific lesson
const lesson = await sheetsAPI.getLesson('L001');
console.log(lesson.lessonName); // "Laws of Motion"
```

---

## ✨ Features

### 🔄 Automatic Merging
The integration automatically merges:
- Questions + Answers (by global_question_id)
- Questions + Lesson info (by lesson_id)

So you get complete question objects with everything!

### 📦 Smart Caching
- Data cached for 5 minutes
- Reduces API calls
- Fast subsequent loads

### 🔍 Multiple Indexes
- By grade
- By subject  
- By lesson
- By question ID

### 🛡️ Error Handling
- Connection errors caught
- Detailed error messages
- Graceful fallbacks

---

## ⚠️ Troubleshooting

### Error: "Failed to fetch"
**Cause:** Sheet is not public

**Solution:**
1. Click Share button
2. Change to "Anyone with the link"
3. Set to "Viewer"

### Error: "Empty response"
**Cause:** Wrong GID or sheet is empty

**Solution:**
1. Verify GID numbers match your sheet tabs
2. Check that sheets have data
3. Ensure column headers match exactly

### Questions not loading
**Cause:** Column names don't match

**Solution:**
Ensure exact column names (case-sensitive):
- Questions: `global_question_id`, `question_code`, `board`, `medium`, `grade`, `subject`, `lesson_no`, `question_no`, `question_text`, `lesson_id`
- Lesson: `lesson_id`, `lesson_name`, `lesson_doc_id`
- Master Answer: `global_question_id`, `level_basic`, `level_elementary`, `level_intermediate`, `level_advanced`, `level_prodigy`

### CORS errors in browser
**Cause:** Sheet not published or wrong URL format

**Solution:**
1. Make sheet public (Share → Anyone with link)
2. Use CSV export URL format
3. Try in different browser (Chrome/Firefox)

---

## 🔒 Security Notes

- ✅ **Read-only access** - Integration only reads data
- ⚠️ **Public data** - Anyone with link can view
- 🚫 **No sensitive info** - Don't put passwords, personal data
- 🔑 **No authentication** - No API keys needed

---

## 📈 Next Steps

### Optional: Add More Sheets

You can add these sheets later:

**Rubrics** (for detailed evaluation):
```csv
question_id,concept,description,max_points,keywords,importance
```

**Student Progress** (to track attempts):
```csv
student_id,question_id,attempt,score,timestamp,response
```

### Update index.html

Modify your `index.html` to use real data from sheets instead of hardcoded questions:

```javascript
// Replace hardcoded questions with:
async function loadQuestions() {
    const questions = await sheetsAPI.getQuestions(10, 'science', 1);
    displayQuestions(questions);
}
```

---

**Ready to test?** Open `sheets-demo.html` to verify everything works!

**Need help?** Check browser console (F12) for detailed error messages.

/**
 * Google Sheets Integration Module for Acharya108 Recitation App
 * Integrates with Google Sheets: 19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo
 */

class SheetsIntegration {
    constructor() {
        this.SHEET_ID = '19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo';
        
        // Published CSV URLs for each sheet (update these after publishing)
        this.SHEET_URLS = {
            sheet1: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`,
            sheet2: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=1`,
            sheet3: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=2`
        };
        
        // Cache for loaded data
        this.cache = {
            questions: null,
            rubrics: null,
            progress: null,
            lastUpdated: null
        };
        
        // Cache duration in milliseconds (5 minutes)
        this.CACHE_DURATION = 5 * 60 * 1000;
    }

    /**
     * Parse CSV text into array of objects
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];
        
        // Get headers from first line
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index].trim().replace(/^"|"$/g, '');
                });
                data.push(row);
            }
        }
        
        return data;
    }

    /**
     * Parse a single CSV line handling quoted values
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        
        return values;
    }

    /**
     * Check if cache is valid
     */
    isCacheValid() {
        if (!this.cache.lastUpdated) return false;
        return (Date.now() - this.cache.lastUpdated) < this.CACHE_DURATION;
    }

    /**
     * Fetch data from Google Sheets
     */
    async fetchSheet(sheetKey) {
        try {
            const response = await fetch(this.SHEET_URLS[sheetKey]);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${sheetKey}: ${response.status}`);
            }
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error(`Error fetching ${sheetKey}:`, error);
            throw error;
        }
    }

    /**
     * Load all sheets data
     */
    async loadAllSheets() {
        if (this.isCacheValid()) {
            console.log('Using cached data');
            return this.cache;
        }

        try {
            console.log('Loading data from Google Sheets...');
            
            const [sheet1Data, sheet2Data, sheet3Data] = await Promise.all([
                this.fetchSheet('sheet1'),
                this.fetchSheet('sheet2'),
                this.fetchSheet('sheet3')
            ]);

            // Process data based on your sheet structure
            this.cache = {
                questions: this.processQuestionsSheet(sheet1Data),
                rubrics: this.processRubricsSheet(sheet2Data),
                progress: this.processProgressSheet(sheet3Data),
                lastUpdated: Date.now()
            };

            console.log('✅ Sheets loaded successfully');
            return this.cache;
        } catch (error) {
            console.error('❌ Failed to load sheets:', error);
            throw error;
        }
    }

    /**
     * Process questions sheet data
     * Expected columns: Grade, Subject, Lesson, Type, Question, BasicAnswer, ElementaryAnswer, 
     * IntermediateAnswer, AdvancedAnswer, ExpertAnswer, Keywords
     */
    processQuestionsSheet(data) {
        const questions = {
            byGrade: {},
            bySubject: {},
            all: []
        };

        data.forEach(row => {
            const question = {
                id: row.ID || `q_${Date.now()}_${Math.random()}`,
                grade: parseInt(row.Grade) || 10,
                subject: row.Subject || 'science',
                lesson: parseInt(row.Lesson) || 1,
                type: row.Type || 'brief',
                question: row.Question || '',
                answers: {
                    basic: row.BasicAnswer || '',
                    elementary: row.ElementaryAnswer || '',
                    intermediate: row.IntermediateAnswer || '',
                    advanced: row.AdvancedAnswer || '',
                    expert: row.ExpertAnswer || ''
                },
                keywords: (row.Keywords || '').split(',').map(k => k.trim()).filter(k => k)
            };

            // Index by grade
            if (!questions.byGrade[question.grade]) {
                questions.byGrade[question.grade] = [];
            }
            questions.byGrade[question.grade].push(question);

            // Index by subject
            if (!questions.bySubject[question.subject]) {
                questions.bySubject[question.subject] = [];
            }
            questions.bySubject[question.subject].push(question);

            questions.all.push(question);
        });

        return questions;
    }

    /**
     * Process rubrics sheet data
     * Expected columns: QuestionID, Concept, Description, MaxPoints, Keywords, Importance
     */
    processRubricsSheet(data) {
        const rubrics = {};

        data.forEach(row => {
            const questionId = row.QuestionID || row.Question;
            
            if (!rubrics[questionId]) {
                rubrics[questionId] = [];
            }

            rubrics[questionId].push({
                concept: row.Concept || '',
                description: row.Description || '',
                maxPoints: parseFloat(row.MaxPoints) || 10,
                keywords: (row.Keywords || '').split(',').map(k => k.trim()).filter(k => k),
                importance: row.Importance || 'medium'
            });
        });

        return rubrics;
    }

    /**
     * Process student progress sheet data
     * Expected columns: StudentID, QuestionID, Attempt, Score, Timestamp, Response
     */
    processProgressSheet(data) {
        const progress = {
            byStudent: {},
            all: []
        };

        data.forEach(row => {
            const record = {
                studentId: row.StudentID || 'anonymous',
                questionId: row.QuestionID || '',
                attempt: parseInt(row.Attempt) || 1,
                score: parseFloat(row.Score) || 0,
                timestamp: row.Timestamp || new Date().toISOString(),
                response: row.Response || ''
            };

            if (!progress.byStudent[record.studentId]) {
                progress.byStudent[record.studentId] = [];
            }
            progress.byStudent[record.studentId].push(record);
            progress.all.push(record);
        });

        return progress;
    }

    /**
     * Get questions for specific grade and subject
     */
    async getQuestions(grade, subject, lesson = null) {
        const data = await this.loadAllSheets();
        let questions = data.questions.byGrade[grade] || [];
        
        if (subject) {
            questions = questions.filter(q => q.subject === subject);
        }
        
        if (lesson !== null) {
            questions = questions.filter(q => q.lesson === lesson);
        }
        
        return questions;
    }

    /**
     * Get a specific question by ID or text
     */
    async getQuestion(questionIdOrText) {
        const data = await this.loadAllSheets();
        return data.questions.all.find(q => 
            q.id === questionIdOrText || q.question === questionIdOrText
        );
    }

    /**
     * Get rubric for a specific question
     */
    async getRubric(questionIdOrText) {
        const data = await this.loadAllSheets();
        const question = await this.getQuestion(questionIdOrText);
        
        if (!question) return null;
        
        return data.rubrics[question.id] || data.rubrics[question.question] || null;
    }

    /**
     * Get answer for specific level
     */
    async getAnswer(questionIdOrText, level = 'basic') {
        const question = await this.getQuestion(questionIdOrText);
        if (!question) return null;
        
        return question.answers[level] || question.answers.basic;
    }

    /**
     * Save student progress (requires Apps Script backend)
     */
    async saveProgress(studentId, questionId, score, response) {
        // This requires a Google Apps Script Web App endpoint
        // See setupAppsScriptBackend() method for instructions
        
        const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
        
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'saveProgress',
                    studentId,
                    questionId,
                    score,
                    response,
                    timestamp: new Date().toISOString()
                })
            });
            
            console.log('✅ Progress saved to Google Sheets');
            return true;
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
            return false;
        }
    }

    /**
     * Clear cache to force refresh
     */
    clearCache() {
        this.cache = {
            questions: null,
            rubrics: null,
            progress: null,
            lastUpdated: null
        };
        console.log('Cache cleared');
    }

    /**
     * Instructions for setting up Apps Script backend for write operations
     */
    setupAppsScriptBackend() {
        return `
To enable saving student progress back to Google Sheets:

1. Open your Google Sheet
2. Go to Extensions → Apps Script
3. Paste this code:

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet3');
        
        if (data.action === 'saveProgress') {
            sheet.appendRow([
                data.studentId,
                data.questionId,
                '', // Attempt number (calculate based on existing records)
                data.score,
                data.timestamp,
                data.response
            ]);
            
            return ContentService.createTextOutput(JSON.stringify({
                status: 'success'
            })).setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

4. Deploy as Web App
5. Set "Execute as" to "Me"
6. Set "Who has access" to "Anyone"
7. Copy the Web App URL and update APPS_SCRIPT_URL in sheets-integration.js
        `;
    }
}

// Export for use in the application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheetsIntegration;
}

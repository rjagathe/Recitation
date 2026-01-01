/**
 * Google Sheets Integration Module for Acharya108 Recitation App
 * Integrates with Google Sheets: 19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo
 * 
 * IMPORTANT: To use this integration, you must publish your Google Sheets:
 * 1. Open your Google Sheet
 * 2. File → Share → Publish to web
 * 3. Select each sheet and publish as CSV
 * 4. Update the gid values below if needed
 */

class SheetsIntegration {
    constructor() {
        this.SHEET_ID = '19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo';
        
        // GID values for each sheet (update these based on your actual sheet GIDs)
        // To find GID: Open sheet tab, look at URL: /edit#gid=XXXXXXXX
        this.SHEET_GIDS = {
            questions: '0',        // First sheet (Questions)
            rubrics: '1',          // Second sheet (Rubrics)
            progress: '2'          // Third sheet (Student Progress)
        };
        
        // Published CSV URLs for each sheet
        this.SHEET_URLS = {
            questions: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=${this.SHEET_GIDS.questions}`,
            rubrics: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=${this.SHEET_GIDS.rubrics}`,
            progress: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=${this.SHEET_GIDS.progress}`
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
        
        // Status tracking
        this.isLoading = false;
        this.loadError = null;
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
     * Fetch data from Google Sheets with CORS handling
     */
    async fetchSheet(sheetKey) {
        try {
            const url = this.SHEET_URLS[sheetKey];
            console.log(`📥 Fetching ${sheetKey} from:`, url);
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            
            if (!csvText || csvText.trim().length === 0) {
                throw new Error('Empty response received');
            }
            
            const parsed = this.parseCSV(csvText);
            console.log(`✅ ${sheetKey}: Loaded ${parsed.length} rows`);
            return parsed;
            
        } catch (error) {
            console.error(`❌ Error fetching ${sheetKey}:`, error);
            throw new Error(`Failed to load ${sheetKey}: ${error.message}`);
        }
    }

    /**
     * Load all sheets data
     */
    async loadAllSheets() {
        if (this.isCacheValid()) {
            console.log('✨ Using cached data');
            return this.cache;
        }

        if (this.isLoading) {
            console.log('⏳ Already loading...');
            await new Promise(resolve => {
                const checkLoading = setInterval(() => {
                    if (!this.isLoading) {
                        clearInterval(checkLoading);
                        resolve();
                    }
                }, 100);
            });
            return this.cache;
        }

        this.isLoading = true;
        this.loadError = null;

        try {
            console.log('🔄 Loading data from Google Sheets...');
            
            const [questionsData, rubricsData, progressData] = await Promise.all([
                this.fetchSheet('questions'),
                this.fetchSheet('rubrics'),
                this.fetchSheet('progress')
            ]);

            // Process data based on your sheet structure
            this.cache = {
                questions: this.processQuestionsSheet(questionsData),
                rubrics: this.processRubricsSheet(rubricsData),
                progress: this.processProgressSheet(progressData),
                lastUpdated: Date.now()
            };

            console.log('✅ All sheets loaded successfully!');
            console.log('📊 Summary:', {
                questions: this.cache.questions.all.length,
                rubrics: Object.keys(this.cache.rubrics).length,
                progress: this.cache.progress.all.length
            });
            
            return this.cache;
            
        } catch (error) {
            console.error('❌ Failed to load sheets:', error);
            this.loadError = error.message;
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Process questions sheet data
     * Expected columns: ID, Grade, Subject, Lesson, Type, Question, BasicAnswer, 
     * ElementaryAnswer, IntermediateAnswer, AdvancedAnswer, ExpertAnswer, Keywords
     */
    processQuestionsSheet(data) {
        const questions = {
            byGrade: {},
            bySubject: {},
            byLesson: {},
            all: []
        };

        data.forEach((row, index) => {
            const question = {
                id: row.ID || row.id || `q_${index}`,
                grade: parseInt(row.Grade || row.grade) || 10,
                subject: (row.Subject || row.subject || 'science').toLowerCase(),
                lesson: parseInt(row.Lesson || row.lesson) || 1,
                type: (row.Type || row.type || 'brief').toLowerCase(),
                question: row.Question || row.question || '',
                answers: {
                    basic: row.BasicAnswer || row.basicAnswer || '',
                    elementary: row.ElementaryAnswer || row.elementaryAnswer || '',
                    intermediate: row.IntermediateAnswer || row.intermediateAnswer || '',
                    advanced: row.AdvancedAnswer || row.advancedAnswer || '',
                    expert: row.ExpertAnswer || row.expertAnswer || ''
                },
                keywords: (row.Keywords || row.keywords || '').split(',').map(k => k.trim()).filter(k => k)
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

            // Index by lesson
            const lessonKey = `${question.grade}_${question.subject}_${question.lesson}`;
            if (!questions.byLesson[lessonKey]) {
                questions.byLesson[lessonKey] = [];
            }
            questions.byLesson[lessonKey].push(question);

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
            const questionId = row.QuestionID || row.questionId || row.Question || row.question;
            
            if (!questionId) return;
            
            if (!rubrics[questionId]) {
                rubrics[questionId] = [];
            }

            rubrics[questionId].push({
                concept: row.Concept || row.concept || '',
                description: row.Description || row.description || '',
                maxPoints: parseFloat(row.MaxPoints || row.maxPoints) || 10,
                keywords: (row.Keywords || row.keywords || '').split(',').map(k => k.trim()).filter(k => k),
                importance: (row.Importance || row.importance || 'medium').toLowerCase()
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
            byQuestion: {},
            all: []
        };

        data.forEach(row => {
            const record = {
                studentId: row.StudentID || row.studentId || 'anonymous',
                questionId: row.QuestionID || row.questionId || '',
                attempt: parseInt(row.Attempt || row.attempt) || 1,
                score: parseFloat(row.Score || row.score) || 0,
                timestamp: row.Timestamp || row.timestamp || new Date().toISOString(),
                response: row.Response || row.response || ''
            };

            // Index by student
            if (!progress.byStudent[record.studentId]) {
                progress.byStudent[record.studentId] = [];
            }
            progress.byStudent[record.studentId].push(record);
            
            // Index by question
            if (!progress.byQuestion[record.questionId]) {
                progress.byQuestion[record.questionId] = [];
            }
            progress.byQuestion[record.questionId].push(record);

            progress.all.push(record);
        });

        return progress;
    }

    /**
     * Get questions for specific grade, subject, and lesson
     */
    async getQuestions(grade, subject, lesson = null) {
        try {
            const data = await this.loadAllSheets();
            
            if (lesson !== null) {
                const lessonKey = `${grade}_${subject}_${lesson}`;
                return data.questions.byLesson[lessonKey] || [];
            }
            
            let questions = data.questions.byGrade[grade] || [];
            
            if (subject) {
                questions = questions.filter(q => q.subject === subject);
            }
            
            return questions;
        } catch (error) {
            console.error('Error getting questions:', error);
            return [];
        }
    }

    /**
     * Get a specific question by ID or text
     */
    async getQuestion(questionIdOrText) {
        try {
            const data = await this.loadAllSheets();
            return data.questions.all.find(q => 
                q.id === questionIdOrText || 
                q.question === questionIdOrText ||
                q.question.toLowerCase().includes(questionIdOrText.toLowerCase())
            );
        } catch (error) {
            console.error('Error getting question:', error);
            return null;
        }
    }

    /**
     * Get rubric for a specific question
     */
    async getRubric(questionIdOrText) {
        try {
            const data = await this.loadAllSheets();
            const question = await this.getQuestion(questionIdOrText);
            
            if (!question) return null;
            
            return data.rubrics[question.id] || 
                   data.rubrics[question.question] || 
                   null;
        } catch (error) {
            console.error('Error getting rubric:', error);
            return null;
        }
    }

    /**
     * Get answer for specific level
     */
    async getAnswer(questionIdOrText, level = 'basic') {
        try {
            const question = await this.getQuestion(questionIdOrText);
            if (!question) return null;
            
            return question.answers[level] || question.answers.basic;
        } catch (error) {
            console.error('Error getting answer:', error);
            return null;
        }
    }

    /**
     * Get student progress for a specific student
     */
    async getStudentProgress(studentId) {
        try {
            const data = await this.loadAllSheets();
            return data.progress.byStudent[studentId] || [];
        } catch (error) {
            console.error('Error getting student progress:', error);
            return [];
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
        console.log('🗑️ Cache cleared');
    }

    /**
     * Get loading status
     */
    getStatus() {
        return {
            isLoading: this.isLoading,
            isCached: this.isCacheValid(),
            error: this.loadError,
            lastUpdated: this.cache.lastUpdated ? new Date(this.cache.lastUpdated).toLocaleString() : null
        };
    }
}

// Export for use in the application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheetsIntegration;
}

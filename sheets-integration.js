/**
 * Google Sheets Integration Module for Acharya108 Recitation App
 * Integrates with Google Sheets: 19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo
 * 
 * Sheet Structure:
 * - Sheet 1: Questions (global_question_id, question_code, board, medium, grade, subject, lesson_no, question_no, question_text, lesson_id)
 * - Sheet 2: Lesson (lesson_id, lesson_name, lesson_doc_id)
 * - Sheet 3: Master Answer (global_question_id, level_basic, level_elementary, level_intermediate, level_advanced, level_prodigy)
 */

class SheetsIntegration {
    constructor() {
        this.SHEET_ID = '19m22llWuLAfL1zSjBzzCZnHbBelHHCtW62zH4tP9MWo';
        
        // GID values for each sheet (default values - update if different)
        this.SHEET_GIDS = {
            questions: '0',        // Questions sheet
            lessons: '2069783031',          // Lesson sheet
            answers: '1282895725'           // Master Answer sheet
        };
        
        // Published CSV URLs for each sheet
        this.SHEET_URLS = {
            questions: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=${this.SHEET_GIDS.questions}`,
            lessons: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=${this.SHEET_GIDS.lessons}`,
            answers: `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=${this.SHEET_GIDS.answers}`
        };
        
        // Cache for loaded data
        this.cache = {
            questions: null,
            lessons: null,
            answers: null,
            merged: null,  // Questions with answers merged
            lastUpdated: null
        };
        
        // Cache duration in milliseconds (5 minutes)
        this.CACHE_DURATION = 5 * 60 * 1000;
        
        // Status tracking
        this.isLoading = false;
        this.loadError = null;
    }

    /**
     * Normalize question ID to handle both "1" and "00001" formats
     */
    normalizeQuestionId(id) {
        if (!id) return '';
        // Convert to string and pad with zeros to 5 digits
        const numericId = parseInt(id.toString().replace(/^0+/, '')) || 0;
        return numericId.toString().padStart(5, '0');
    }

    /**
     * Parse CSV text into array of objects
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];
        
        // Get headers from first line
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        console.log('📋 CSV Headers:', headers);
        
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
                
                // Log first row for debugging
                if (i === 1) {
                    console.log('📝 First data row:', row);
                }
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
     * Helper to get value from object with multiple possible key names
     */
    getValue(obj, ...keys) {
        for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                return obj[key];
            }
        }
        return '';
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
            console.log(`📥 Fetching ${sheetKey} from Google Sheets...`);
            
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
            
            const [questionsData, lessonsData, answersData] = await Promise.all([
                this.fetchSheet('questions'),
                this.fetchSheet('lessons'),
                this.fetchSheet('answers')
            ]);

            // Process data
            const questions = this.processQuestionsSheet(questionsData);
            const lessons = this.processLessonsSheet(lessonsData);
            const answers = this.processAnswersSheet(answersData);
            const merged = this.mergeQuestionsAndAnswers(questions, answers, lessons);

            this.cache = {
                questions,
                lessons,
                answers,
                merged,
                lastUpdated: Date.now()
            };

            console.log('✅ All sheets loaded successfully!');
            console.log('📊 Summary:', {
                questions: questions.all.length,
                lessons: lessons.all.length,
                answers: answers.all.length,
                merged: merged.all.length
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
     * Process Questions sheet
     */
    processQuestionsSheet(data) {
        const questions = {
            byId: {},
            byGrade: {},
            bySubject: {},
            byLesson: {},
            all: []
        };

        data.forEach(row => {
            const rawId = this.getValue(row, 'global_question_id', 'globalQuestionId', 'Global Question ID');
            const normalizedId = this.normalizeQuestionId(rawId);
            
            const question = {
                globalQuestionId: normalizedId,
                questionCode: this.getValue(row, 'question_code', 'questionCode', 'Question Code'),
                board: (this.getValue(row, 'board', 'Board') || 'tn').toLowerCase(),
                medium: (this.getValue(row, 'medium', 'Medium') || 'english').toLowerCase(),
                grade: parseInt(this.getValue(row, 'grade', 'Grade')) || 10,
                subject: (this.getValue(row, 'subject', 'Subject') || '').toLowerCase(),
                lessonNo: parseInt(this.getValue(row, 'lesson_no', 'lessonNo', 'Lesson No')) || 1,
                questionNo: parseInt(this.getValue(row, 'question_no', 'questionNo', 'Question No')) || 1,
                questionText: this.getValue(row, 'question_text', 'questionText', 'Question Text'),
                lessonId: this.getValue(row, 'lesson_id', 'lessonId', 'Lesson ID')
            };

            // Index by global question ID
            questions.byId[normalizedId] = question;

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
            const lessonKey = `${question.grade}_${question.subject}_${question.lessonNo}`;
            if (!questions.byLesson[lessonKey]) {
                questions.byLesson[lessonKey] = [];
            }
            questions.byLesson[lessonKey].push(question);

            questions.all.push(question);
        });

        console.log('📝 Sample normalized question ID:', questions.all[0]?.globalQuestionId);
        return questions;
    }

    /**
     * Process Lessons sheet
     */
    processLessonsSheet(data) {
        const lessons = {
            byId: {},
            all: []
        };

        data.forEach(row => {
            const lesson = {
                lessonId: this.getValue(row, 'lesson_id', 'lessonId', 'Lesson ID'),
                lessonName: this.getValue(row, 'lesson_name', 'lessonName', 'Lesson Name'),
                lessonDocId: this.getValue(row, 'lesson_doc_id', 'lessonDocId', 'Lesson Doc ID')
            };

            lessons.byId[lesson.lessonId] = lesson;
            lessons.all.push(lesson);
        });

        return lessons;
    }

    /**
     * Process Master Answer sheet
     */
    processAnswersSheet(data) {
        const answers = {
            byId: {},
            all: []
        };

        data.forEach(row => {
            const rawId = this.getValue(row, 'global_question_id', 'globalQuestionId', 'Global Question ID');
            const normalizedId = this.normalizeQuestionId(rawId);
            
            const answer = {
                globalQuestionId: normalizedId,
                levels: {
                    basic: this.getValue(row, 'level_basic', 'levelBasic', 'Level Basic', 'Basic'),
                    elementary: this.getValue(row, 'level_elementary', 'levelElementary', 'Level Elementary', 'Elementary'),
                    intermediate: this.getValue(row, 'level_intermediate', 'levelIntermediate', 'Level Intermediate', 'Intermediate'),
                    advanced: this.getValue(row, 'level_advanced', 'levelAdvanced', 'Level Advanced', 'Advanced'),
                    prodigy: this.getValue(row, 'level_prodigy', 'levelProdigy', 'Level Prodigy', 'Prodigy')
                }
            };

            console.log(`🔍 Answer for ${normalizedId} (raw: ${rawId}):`, {
                hasBasic: !!answer.levels.basic,
                basicLength: answer.levels.basic?.length || 0
            });

            answers.byId[normalizedId] = answer;
            answers.all.push(answer);
        });

        console.log('📚 Total answers indexed:', Object.keys(answers.byId).length);
        console.log('📝 Sample answer IDs:', Object.keys(answers.byId).slice(0, 3));

        return answers;
    }

    /**
     * Merge questions with their answers and lesson info
     */
    mergeQuestionsAndAnswers(questions, answers, lessons) {
        const merged = {
            byId: {},
            byGrade: {},
            bySubject: {},
            byLesson: {},
            all: []
        };

        let matchedAnswers = 0;
        let unmatchedQuestions = [];

        questions.all.forEach(question => {
            const answer = answers.byId[question.globalQuestionId];
            const lesson = lessons.byId[question.lessonId] || {};

            if (!answer) {
                console.warn(`⚠️ No answer found for question: ${question.globalQuestionId}`);
                unmatchedQuestions.push(question.globalQuestionId);
            } else if (answer.levels.basic && answer.levels.basic.trim()) {
                matchedAnswers++;
                console.log(`✅ Matched answer for ${question.globalQuestionId}`);
            } else {
                console.warn(`⚠️ Empty answer for question: ${question.globalQuestionId}`);
            }

            const mergedItem = {
                ...question,
                lessonName: lesson.lessonName || '',
                lessonDocId: lesson.lessonDocId || '',
                answers: answer ? {
                    basic: answer.levels.basic || '',
                    elementary: answer.levels.elementary || '',
                    intermediate: answer.levels.intermediate || '',
                    advanced: answer.levels.advanced || '',
                    prodigy: answer.levels.prodigy || '',
                    expert: answer.levels.prodigy || '' // Alias for compatibility
                } : {
                    basic: '',
                    elementary: '',
                    intermediate: '',
                    advanced: '',
                    prodigy: '',
                    expert: ''
                }
            };

            // Index by ID
            merged.byId[mergedItem.globalQuestionId] = mergedItem;

            // Index by grade
            if (!merged.byGrade[mergedItem.grade]) {
                merged.byGrade[mergedItem.grade] = [];
            }
            merged.byGrade[mergedItem.grade].push(mergedItem);

            // Index by subject
            if (!merged.bySubject[mergedItem.subject]) {
                merged.bySubject[mergedItem.subject] = [];
            }
            merged.bySubject[mergedItem.subject].push(mergedItem);

            // Index by lesson
            const lessonKey = `${mergedItem.grade}_${mergedItem.subject}_${mergedItem.lessonNo}`;
            if (!merged.byLesson[lessonKey]) {
                merged.byLesson[lessonKey] = [];
            }
            merged.byLesson[lessonKey].push(mergedItem);

            merged.all.push(mergedItem);
        });

        console.log(`✅ Merged ${matchedAnswers} questions with non-empty answers`);
        if (unmatchedQuestions.length > 0) {
            console.warn(`⚠️ ${unmatchedQuestions.length} questions without answers:`, unmatchedQuestions);
        }

        return merged;
    }

    /**
     * Get questions for specific grade, subject, and lesson
     */
    async getQuestions(grade, subject, lessonNo = null) {
        try {
            const data = await this.loadAllSheets();
            
            if (lessonNo !== null) {
                const lessonKey = `${grade}_${subject}_${lessonNo}`;
                return data.merged.byLesson[lessonKey] || [];
            }
            
            let questions = data.merged.byGrade[grade] || [];
            
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
            
            // Try by normalized ID first
            const normalizedId = this.normalizeQuestionId(questionIdOrText);
            if (data.merged.byId[normalizedId]) {
                return data.merged.byId[normalizedId];
            }
            
            // Then search by text
            return data.merged.all.find(q => 
                q.questionText === questionIdOrText ||
                q.questionText.toLowerCase().includes(questionIdOrText.toLowerCase())
            );
        } catch (error) {
            console.error('Error getting question:', error);
            return null;
        }
    }

    /**
     * Get answer for specific level
     */
    async getAnswer(questionIdOrText, level = 'basic') {
        try {
            const question = await this.getQuestion(questionIdOrText);
            if (!question || !question.answers) return null;
            
            return question.answers[level] || question.answers.basic;
        } catch (error) {
            console.error('Error getting answer:', error);
            return null;
        }
    }

    /**
     * Get lesson information
     */
    async getLesson(lessonId) {
        try {
            const data = await this.loadAllSheets();
            return data.lessons.byId[lessonId] || null;
        } catch (error) {
            console.error('Error getting lesson:', error);
            return null;
        }
    }

    /**
     * Get all lessons
     */
    async getAllLessons() {
        try {
            const data = await this.loadAllSheets();
            return data.lessons.all;
        } catch (error) {
            console.error('Error getting lessons:', error);
            return [];
        }
    }

    /**
     * Clear cache to force refresh
     */
    clearCache() {
        this.cache = {
            questions: null,
            lessons: null,
            answers: null,
            merged: null,
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
            lastUpdated: this.cache.lastUpdated ? new Date(this.cache.lastUpdated).toLocaleString() : null,
            dataCount: this.cache.merged ? {
                questions: this.cache.merged.all.length,
                lessons: this.cache.lessons.all.length,
                answers: this.cache.answers.all.length
            } : null
        };
    }
}

// Export for use in the application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheetsIntegration;
}

// ===== ADVANCED SCORING ALGORITHM FOR RECITATION APP =====
// Handles fuzzy matching, spelling errors, pronunciation issues, and semantic evaluation

class RecitationScorer {
    constructor() {
        // Levenshtein distance for fuzzy matching
        this.levenshteinDistance = (str1, str2) => {
            const len1 = str1.length;
            const len2 = str2.length;
            const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

            for (let i = 0; i <= len1; i++) matrix[i][0] = i;
            for (let j = 0; j <= len2; j++) matrix[0][j] = j;

            for (let i = 1; i <= len1; i++) {
                for (let j = 1; j <= len2; j++) {
                    const cost = str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase() ? 0 : 1;
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,      // deletion
                        matrix[i][j - 1] + 1,      // insertion
                        matrix[i - 1][j - 1] + cost // substitution
                    );
                }
            }
            return matrix[len1][len2];
        };

        // Calculate similarity ratio (0 to 1)
        this.similarityRatio = (str1, str2) => {
            const distance = this.levenshteinDistance(str1, str2);
            const maxLen = Math.max(str1.length, str2.length);
            return maxLen === 0 ? 1.0 : 1 - (distance / maxLen);
        };

        // Token-based fuzzy matching (handles word order differences)
        this.tokenSetRatio = (str1, str2) => {
            const tokens1 = this.tokenize(str1);
            const tokens2 = this.tokenize(str2);
            
            const intersection = tokens1.filter(t => tokens2.includes(t));
            const union = [...new Set([...tokens1, ...tokens2])];
            
            if (union.length === 0) return 0;
            return intersection.length / union.length;
        };

        // Tokenization with stopword removal
        this.tokenize = (text) => {
            const stopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                               'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'its', 'it'];
            return text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2 && !stopwords.includes(word));
        };

        // Find best matching phrase in student answer
        this.findBestMatch = (keyPhrase, studentAnswer, alternatives = []) => {
            const phrasesToCheck = [keyPhrase, ...alternatives];
            let bestMatch = {
                phrase: '',
                score: 0,
                position: -1
            };

            const studentTokens = this.tokenize(studentAnswer);
            const studentLower = studentAnswer.toLowerCase();

            for (const phrase of phrasesToCheck) {
                const phraseTokens = this.tokenize(phrase);
                const phraseLower = phrase.toLowerCase();
                
                // Exact substring match (best case)
                if (studentLower.includes(phraseLower)) {
                    return {
                        phrase: phrase,
                        score: 1.0,
                        position: studentLower.indexOf(phraseLower)
                    };
                }

                // Token-based matching
                const tokenScore = this.tokenSetRatio(phrase, studentAnswer);
                if (tokenScore > bestMatch.score) {
                    bestMatch = {
                        phrase: phrase,
                        score: tokenScore,
                        position: 0
                    };
                }

                // Sliding window fuzzy matching
                for (let i = 0; i < studentTokens.length; i++) {
                    const window = studentTokens.slice(i, i + phraseTokens.length).join(' ');
                    const similarity = this.similarityRatio(phrase.toLowerCase(), window);
                    
                    if (similarity > bestMatch.score) {
                        bestMatch = {
                            phrase: window,
                            score: similarity,
                            position: i
                        };
                    }
                }
            }

            return bestMatch;
        };
    }

    // Main evaluation function
    async evaluateAnswer(questionId, studentAnswer, rubricData) {
        const results = {
            totalScore: 0,
            maxPossibleScore: rubricData.maxPoints,
            percentageScore: 0,
            matchedItems: [],
            missedItems: [],
            feedback: [],
            performanceLevel: ''
        };

        // Process each rubric item
        for (const item of rubricData.rubricItems) {
            const alternatives = item.alternative_phrases || [];
            
            const match = this.findBestMatch(
                item.key_phrase,
                studentAnswer,
                alternatives
            );

            if (match.score >= item.fuzzy_threshold) {
                // Award points based on match quality
                const pointsAwarded = item.points_value * match.score;
                results.totalScore += pointsAwarded;

                results.matchedItems.push({
                    rubricId: item.rubric_id,
                    keyPhrase: item.key_phrase,
                    matchedText: match.phrase,
                    similarityScore: match.score,
                    pointsAwarded: pointsAwarded,
                    category: item.category
                });

                // Positive feedback
                if (match.score >= 0.95) {
                    results.feedback.push({
                        type: 'strength',
                        text: `Excellent coverage of "${item.key_phrase}" (${item.category})`
                    });
                } else if (match.score >= item.fuzzy_threshold) {
                    results.feedback.push({
                        type: 'strength',
                        text: `Good mention of concept related to "${item.key_phrase}"`
                    });
                }
            } else {
                results.missedItems.push({
                    rubricId: item.rubric_id,
                    keyPhrase: item.key_phrase,
                    pointsLost: item.points_value,
                    isMandatory: item.is_mandatory,
                    category: item.category
                });

                // Improvement feedback
                const feedbackText = item.is_mandatory ?
                    `Missing critical concept: "${item.key_phrase}" (${item.category}) - worth ${item.points_value} points` :
                    `Could improve by including: "${item.key_phrase}" (${item.category})`;
                
                results.feedback.push({
                    type: item.is_mandatory ? 'missing' : 'improvement',
                    text: feedbackText
                });
            }
        }

        // Calculate percentage
        results.percentageScore = (results.totalScore / results.maxPossibleScore) * 100;

        // Determine performance level
        const perfLevel = this.getPerformanceLevel(results.percentageScore);
        results.performanceLevel = perfLevel.name;
        results.feedback.unshift({
            type: 'summary',
            text: perfLevel.message
        });

        return results;
    }

    getPerformanceLevel(percentage) {
        if (percentage >= 90) {
            return { name: 'Excellent', message: `Outstanding! You scored ${percentage.toFixed(1)}% - Excellent understanding!` };
        } else if (percentage >= 75) {
            return { name: 'Good', message: `Well done! You scored ${percentage.toFixed(1)}% - Good grasp of the topic.` };
        } else if (percentage >= 60) {
            return { name: 'Fair', message: `You scored ${percentage.toFixed(1)}% - Fair. Review the missed concepts.` };
        } else {
            return { name: 'Poor', message: `You scored ${percentage.toFixed(1)}% - Significant review needed.` };
        }
    }

    // Save evaluation results (for future database integration)
    async saveEvaluation(questionId, studentName, studentAnswer, timeTaken, evaluationResults) {
        const evaluationRecord = {
            questionId: questionId,
            studentName: studentName,
            studentAnswer: studentAnswer,
            timeTaken: timeTaken,
            totalScore: evaluationResults.totalScore,
            percentageScore: evaluationResults.percentageScore,
            performanceLevel: evaluationResults.performanceLevel,
            timestamp: new Date().toISOString(),
            matchedItems: evaluationResults.matchedItems,
            missedItems: evaluationResults.missedItems,
            feedback: evaluationResults.feedback
        };

        // Store in localStorage for now (can be migrated to SQLite later)
        const existingData = JSON.parse(localStorage.getItem('recitationEvaluations') || '[]');
        existingData.push(evaluationRecord);
        localStorage.setItem('recitationEvaluations', JSON.stringify(existingData));

        return evaluationRecord;
    }

    // Get student history
    getStudentHistory(studentName = null) {
        const allData = JSON.parse(localStorage.getItem('recitationEvaluations') || '[]');
        if (studentName) {
            return allData.filter(record => record.studentName === studentName);
        }
        return allData;
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecitationScorer;
}
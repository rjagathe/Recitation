-- ===== RECITATION APP DATABASE SCHEMA =====
-- SQLite database for storing questions, rubrics, and student evaluations

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    difficulty_level TEXT CHECK(difficulty_level IN ('Easy', 'Medium', 'Hard')),
    time_limit_seconds INTEGER DEFAULT 300,
    total_points INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Model Answers Table
CREATE TABLE IF NOT EXISTS model_answers (
    answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    model_answer_text TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT 1,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Key Phrases/Rubric Items Table
CREATE TABLE IF NOT EXISTS rubric_items (
    rubric_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    key_phrase TEXT NOT NULL,
    points_value REAL NOT NULL,
    is_mandatory BOOLEAN DEFAULT 0,
    category TEXT, -- e.g., 'definition', 'example', 'explanation'
    alternative_phrases TEXT, -- JSON array of synonyms/alternatives
    fuzzy_threshold REAL DEFAULT 0.80, -- minimum similarity score (0-1)
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Performance Levels Table
CREATE TABLE IF NOT EXISTS performance_levels (
    level_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    level_name TEXT NOT NULL, -- 'Excellent', 'Good', 'Fair', 'Poor'
    min_score_percentage REAL NOT NULL,
    max_score_percentage REAL NOT NULL,
    feedback_template TEXT,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Student Responses Table
CREATE TABLE IF NOT EXISTS student_responses (
    response_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    student_name TEXT,
    student_answer TEXT NOT NULL,
    time_taken_seconds INTEGER,
    total_score REAL,
    percentage_score REAL,
    performance_level TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Detailed Scoring Breakdown Table
CREATE TABLE IF NOT EXISTS scoring_details (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_id INTEGER NOT NULL,
    rubric_id INTEGER NOT NULL,
    matched_phrase TEXT,
    similarity_score REAL,
    points_awarded REAL,
    FOREIGN KEY (response_id) REFERENCES student_responses(response_id) ON DELETE CASCADE,
    FOREIGN KEY (rubric_id) REFERENCES rubric_items(rubric_id) ON DELETE CASCADE
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_id INTEGER NOT NULL,
    feedback_type TEXT CHECK(feedback_type IN ('strength', 'improvement', 'missing')),
    feedback_text TEXT NOT NULL,
    FOREIGN KEY (response_id) REFERENCES student_responses(response_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_rubric_question ON rubric_items(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON student_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_scoring_response ON scoring_details(response_id);
CREATE INDEX IF NOT EXISTS idx_feedback_response ON feedback(response_id);
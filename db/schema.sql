-- Database Schema for Quiz Portal (PostgreSQL / MySQL compatible)

-- 1. Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- 2. Quizzes Table
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- EASY, MEDIUM, HARD
    duration INT NOT NULL, -- in minutes
    CONSTRAINT fk_quiz_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 3. Questions Table
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    image_url VARCHAR(512),
    question_type VARCHAR(50) NOT NULL, -- SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_THE_BLANK
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 4. Options Table
CREATE TABLE options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 5. Quiz Results Table (Leaderboard records)
CREATE TABLE quiz_results (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL DEFAULT 'Anonymous Quizzer',
    score INT NOT NULL,
    percentage DOUBLE PRECISION NOT NULL,
    completion_time INT NOT NULL, -- in seconds
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Indexes for performance and leaderboard sorting
CREATE INDEX idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX idx_quiz_results_score_time ON quiz_results(percentage DESC, completion_time ASC);

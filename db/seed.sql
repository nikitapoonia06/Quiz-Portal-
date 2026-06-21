-- Seed data for Quiz Portal

-- 1. Insert Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Java', 'Java Programming Language basics, OOP, Generics, Collections, and Concurrency.'),
(2, 'Web Development', 'HTML5, CSS3, ES6+ JavaScript, DOM manipulation, and responsive layouts.'),
(3, 'General Knowledge', 'Geography, world wonders, history, and miscellaneous general questions.'),
(4, 'Science', 'Space exploration, basic chemistry, physics, and natural sciences.');

-- Adjust identity sequence for serial fields after manual id inserts (for PostgreSQL)
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 2. Insert Quizzes
INSERT INTO quizzes (id, title, description, category_id, difficulty, duration) VALUES
(1, 'Java Core Basics', 'Test your core knowledge of Java syntax, primitives, loops, and OOP concepts.', 1, 'EASY', 5),
(2, 'JavaScript ES6+ Deep Dive', 'Test your knowledge of ES6+ features, block scopes, arrow functions, and async JS.', 2, 'HARD', 10),
(3, 'World Geography Quiz', 'Take a trip around the globe! Simple geography facts, capitals, and landmarks.', 3, 'EASY', 5),
(4, 'Space and Astronomy', 'Test your knowledge of our solar system, galaxies, and historic space flight missions.', 4, 'MEDIUM', 8);

SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes));

-- 3. Insert Questions, Options for Quiz 1: Java Core Basics
INSERT INTO questions (id, quiz_id, question_text, image_url, question_type) VALUES
(1, 1, 'Which of the following is NOT a primitive data type in Java?', NULL, 'SINGLE_CHOICE'),
(2, 1, 'In Java, standard arrays have a fixed length determined at creation time.', NULL, 'TRUE_FALSE'),
(3, 1, 'What is the entry point method name in a standard standalone Java application?', NULL, 'FILL_IN_THE_BLANK'),
(4, 1, 'Select all valid access modifiers in Java.', NULL, 'MULTIPLE_CHOICE'),
(5, 1, 'Which class is the implicit parent/superclass of all classes in Java?', NULL, 'SINGLE_CHOICE');

SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions));

INSERT INTO options (question_id, option_text, is_correct) VALUES
(1, 'byte', false),
(1, 'short', false),
(1, 'String', true),
(1, 'float', false),

(2, 'True', true),
(2, 'False', false),

(3, 'main', true),

(4, 'private', true),
(4, 'public', true),
(4, 'protected', true),
(4, 'internal', false),

(5, 'Object', true),
(5, 'Class', false),
(5, 'System', false),
(5, 'Throwable', false);

-- 4. Insert Questions, Options for Quiz 2: JavaScript ES6+ Deep Dive
INSERT INTO questions (id, quiz_id, question_text, image_url, question_type) VALUES
(6, 2, 'Which keywords declare a block-scoped variable in ES6 JavaScript?', NULL, 'MULTIPLE_CHOICE'),
(7, 2, 'JavaScript is a single-threaded execution language but supports concurrency through the event loop.', NULL, 'TRUE_FALSE'),
(8, 2, 'What does the console statement console.log(typeof null) output in JavaScript?', NULL, 'FILL_IN_THE_BLANK'),
(9, 2, 'Which array method creates a new array populated with the results of calling a provided function on every element?', NULL, 'SINGLE_CHOICE'),
(10, 2, 'Which of the following are considered falsy values in JavaScript?', NULL, 'MULTIPLE_CHOICE');

SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions));

INSERT INTO options (question_id, option_text, is_correct) VALUES
(6, 'let', true),
(6, 'const', true),
(6, 'var', false),
(6, 'def', false),

(7, 'True', true),
(7, 'False', false),

(8, 'object', true),

(9, 'map()', true),
(9, 'forEach()', false),
(9, 'filter()', false),
(9, 'reduce()', false),

(10, '0', true),
(10, '""', true),
(10, 'null', true),
(10, '[]', false);

-- 5. Insert Questions, Options for Quiz 3: World Geography Quiz
INSERT INTO questions (id, quiz_id, question_text, image_url, question_type) VALUES
(11, 3, 'What is the capital city of Australia?', NULL, 'SINGLE_CHOICE'),
(12, 3, 'Which country is home to the iconic Eiffel Tower landmark?', NULL, 'FILL_IN_THE_BLANK'),
(13, 3, 'Which ocean is the largest ocean on Planet Earth?', NULL, 'SINGLE_CHOICE'),
(14, 3, 'Which countries share a direct land border with Canada?', NULL, 'MULTIPLE_CHOICE'),
(15, 3, 'The Sahara Desert is the largest desert in the world (including polar deserts).', NULL, 'TRUE_FALSE');

SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions));

INSERT INTO options (question_id, option_text, is_correct) VALUES
(11, 'Sydney', false),
(11, 'Melbourne', false),
(11, 'Canberra', true),
(11, 'Brisbane', false),

(12, 'France', true),

(13, 'Atlantic Ocean', false),
(13, 'Pacific Ocean', true),
(13, 'Indian Ocean', false),
(13, 'Arctic Ocean', false),

(14, 'United States', true),
(14, 'Mexico', false),
(14, 'Greenland', false),

(15, 'True', false),
(15, 'False', true);

-- 6. Insert sample historical leaderboard entries
INSERT INTO quiz_results (quiz_id, username, score, percentage, completion_time) VALUES
(1, 'JavaNinja', 5, 100.0, 32),
(1, 'SpringEnthusiast', 4, 80.0, 48),
(2, 'JSEpert', 5, 100.0, 55),
(3, 'ExplorerX', 5, 100.0, 24),
(3, 'GeoMaster', 4, 80.0, 19);

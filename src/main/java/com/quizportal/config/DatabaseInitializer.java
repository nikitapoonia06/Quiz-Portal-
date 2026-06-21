package com.quizportal.config;

import com.quizportal.model.*;
import com.quizportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (categoryRepository.count() > 0) {
            return; // DB already seeded
        }

        // 1. Create Categories
        Category javaCategory = new Category("Java", "Java Programming Language basics, OOP, Generics, Collections, and Concurrency.");
        Category webDevCategory = new Category("Web Development", "HTML5, CSS3, ES6+ JavaScript, DOM manipulation, and responsive layouts.");
        Category geoCategory = new Category("General Knowledge", "Geography, world wonders, history, and miscellaneous general questions.");
        Category scienceCategory = new Category("Science", "Space exploration, basic chemistry, physics, and natural sciences.");

        categoryRepository.saveAll(Arrays.asList(javaCategory, webDevCategory, geoCategory, scienceCategory));

        // 2. Seed Quiz: Java Core Basics
        Quiz javaBasicsQuiz = new Quiz("Java Core Basics", "Test your core knowledge of Java syntax, primitives, loops, and OOP concepts.", javaCategory, Quiz.Difficulty.EASY, 5);
        quizRepository.save(javaBasicsQuiz);

        // Q1: Primitive type
        Question jq1 = new Question(javaBasicsQuiz, "Which of the following is NOT a primitive data type in Java?", null, Question.QuestionType.SINGLE_CHOICE);
        questionRepository.save(jq1);
        optionRepository.save(new Option(jq1, "byte", false));
        optionRepository.save(new Option(jq1, "short", false));
        optionRepository.save(new Option(jq1, "String", true));
        optionRepository.save(new Option(jq1, "float", false));

        // Q2: Array length
        Question jq2 = new Question(javaBasicsQuiz, "In Java, standard arrays have a fixed length determined at creation time.", null, Question.QuestionType.TRUE_FALSE);
        questionRepository.save(jq2);
        optionRepository.save(new Option(jq2, "True", true));
        optionRepository.save(new Option(jq2, "False", false));

        // Q3: Entry point
        Question jq3 = new Question(javaBasicsQuiz, "What is the entry point method name in a standard standalone Java application?", null, Question.QuestionType.FILL_IN_THE_BLANK);
        questionRepository.save(jq3);
        optionRepository.save(new Option(jq3, "main", true)); // The text to match

        // Q4: Access modifiers (MCQ)
        Question jq4 = new Question(javaBasicsQuiz, "Select all valid access modifiers in Java.", null, Question.QuestionType.MULTIPLE_CHOICE);
        questionRepository.save(jq4);
        optionRepository.save(new Option(jq4, "private", true));
        optionRepository.save(new Option(jq4, "public", true));
        optionRepository.save(new Option(jq4, "protected", true));
        optionRepository.save(new Option(jq4, "internal", false));

        // Q5: Superclass
        Question jq5 = new Question(javaBasicsQuiz, "Which class is the implicit parent/superclass of all classes in Java?", null, Question.QuestionType.SINGLE_CHOICE);
        questionRepository.save(jq5);
        optionRepository.save(new Option(jq5, "Object", true));
        optionRepository.save(new Option(jq5, "Class", false));
        optionRepository.save(new Option(jq5, "System", false));
        optionRepository.save(new Option(jq5, "Throwable", false));


        // 3. Seed Quiz: JavaScript ES6+ Deep Dive
        Quiz jsQuiz = new Quiz("JavaScript ES6+ Deep Dive", "Test your knowledge of ES6+ features, block scopes, arrow functions, and async JS.", webDevCategory, Quiz.Difficulty.HARD, 10);
        quizRepository.save(jsQuiz);

        // Q1: Block scoped (MCQ)
        Question jsq1 = new Question(jsQuiz, "Which keywords declare a block-scoped variable in ES6 JavaScript?", null, Question.QuestionType.MULTIPLE_CHOICE);
        questionRepository.save(jsq1);
        optionRepository.save(new Option(jsq1, "let", true));
        optionRepository.save(new Option(jsq1, "const", true));
        optionRepository.save(new Option(jsq1, "var", false));
        optionRepository.save(new Option(jsq1, "def", false));

        // Q2: Async single threaded (T/F)
        Question jsq2 = new Question(jsQuiz, "JavaScript is a single-threaded execution language but supports concurrency through the event loop.", null, Question.QuestionType.TRUE_FALSE);
        questionRepository.save(jsq2);
        optionRepository.save(new Option(jsq2, "True", true));
        optionRepository.save(new Option(jsq2, "False", false));

        // Q3: Typeof null (Fill in the blank)
        Question jsq3 = new Question(jsQuiz, "What does the console statement console.log(typeof null) output in JavaScript?", null, Question.QuestionType.FILL_IN_THE_BLANK);
        questionRepository.save(jsq3);
        optionRepository.save(new Option(jsq3, "object", true));

        // Q4: map() method (Single Choice)
        Question jsq4 = new Question(jsQuiz, "Which array method creates a new array populated with the results of calling a provided function on every element?", null, Question.QuestionType.SINGLE_CHOICE);
        questionRepository.save(jsq4);
        optionRepository.save(new Option(jsq4, "map()", true));
        optionRepository.save(new Option(jsq4, "forEach()", false));
        optionRepository.save(new Option(jsq4, "filter()", false));
        optionRepository.save(new Option(jsq4, "reduce()", false));

        // Q5: Falsy values (MCQ)
        Question jsq5 = new Question(jsQuiz, "Which of the following are considered falsy values in JavaScript?", null, Question.QuestionType.MULTIPLE_CHOICE);
        questionRepository.save(jsq5);
        optionRepository.save(new Option(jsq5, "0", true));
        optionRepository.save(new Option(jsq5, "\"\"", true));
        optionRepository.save(new Option(jsq5, "null", true));
        optionRepository.save(new Option(jsq5, "[]", false));


        // 4. Seed Quiz: World Geography Quiz
        Quiz geoQuiz = new Quiz("World Geography Quiz", "Take a trip around the globe! Simple geography facts, capitals, and landmarks.", geoCategory, Quiz.Difficulty.EASY, 5);
        quizRepository.save(geoQuiz);

        // Q1: Capital Australia
        Question gq1 = new Question(geoQuiz, "What is the capital city of Australia?", null, Question.QuestionType.SINGLE_CHOICE);
        questionRepository.save(gq1);
        optionRepository.save(new Option(gq1, "Sydney", false));
        optionRepository.save(new Option(gq1, "Melbourne", false));
        optionRepository.save(new Option(gq1, "Canberra", true));
        optionRepository.save(new Option(gq1, "Brisbane", false));

        // Q2: Eiffel Tower (Fill blank)
        Question gq2 = new Question(geoQuiz, "Which country is home to the iconic Eiffel Tower landmark?", null, Question.QuestionType.FILL_IN_THE_BLANK);
        questionRepository.save(gq2);
        optionRepository.save(new Option(gq2, "France", true));

        // Q3: Pacific Ocean (Single Choice)
        Question gq3 = new Question(geoQuiz, "Which ocean is the largest ocean on Planet Earth?", null, Question.QuestionType.SINGLE_CHOICE);
        questionRepository.save(gq3);
        optionRepository.save(new Option(gq3, "Atlantic Ocean", false));
        optionRepository.save(new Option(gq3, "Pacific Ocean", true));
        optionRepository.save(new Option(gq3, "Indian Ocean", false));
        optionRepository.save(new Option(gq3, "Arctic Ocean", false));

        // Q4: Border Canada (MCQ)
        Question gq4 = new Question(geoQuiz, "Which countries share a direct land border with Canada?", null, Question.QuestionType.MULTIPLE_CHOICE);
        questionRepository.save(gq4);
        optionRepository.save(new Option(gq4, "United States", true));
        optionRepository.save(new Option(gq4, "Mexico", false));
        optionRepository.save(new Option(gq4, "Greenland", false));

        // Q5: Sahara desert (T/F)
        Question gq5 = new Question(geoQuiz, "The Sahara Desert is the largest desert in the world (including polar deserts).", null, Question.QuestionType.TRUE_FALSE);
        questionRepository.save(gq5);
        optionRepository.save(new Option(gq5, "True", false)); // Polar deserts (Antarctic/Arctic) are actually larger!
        optionRepository.save(new Option(gq5, "False", true));


        // 5. Seed Quiz: Space Exploration & Astronomy
        Quiz spaceQuiz = new Quiz("Space and Astronomy", "Test your knowledge of our solar system, galaxies, and historic space flight missions.", scienceCategory, Quiz.Difficulty.MEDIUM, 8);
        quizRepository.save(spaceQuiz);

        // Q1: Red Planet
        Question sq1 = new Question(spaceQuiz, "Which planet in our solar system is widely known as the 'Red Planet'?", null, Question.QuestionType.SINGLE_CHOICE);
        questionRepository.save(sq1);
        optionRepository.save(new Option(sq1, "Venus", false));
        optionRepository.save(new Option(sq1, "Mars", true));
        optionRepository.save(new Option(sq1, "Jupiter", false));
        optionRepository.save(new Option(sq1, "Saturn", false));

        // Q2: Light travels (T/F)
        Question sq2 = new Question(spaceQuiz, "Light travels faster in a vacuum than through physical glass or air.", null, Question.QuestionType.TRUE_FALSE);
        questionRepository.save(sq2);
        optionRepository.save(new Option(sq2, "True", true));
        optionRepository.save(new Option(sq2, "False", false));

        // Q3: First man moon (Fill blank)
        Question sq3 = new Question(spaceQuiz, "What was the last name of the first human to step on the Moon in 1969? (e.g. Neil _____)", null, Question.QuestionType.FILL_IN_THE_BLANK);
        questionRepository.save(sq3);
        optionRepository.save(new Option(sq3, "Armstrong", true));

        // Q4: Gas giants (MCQ)
        Question sq4 = new Question(spaceQuiz, "Identify all the gas giant planets in our Solar System.", null, Question.QuestionType.MULTIPLE_CHOICE);
        questionRepository.save(sq4);
        optionRepository.save(new Option(sq4, "Jupiter", true));
        optionRepository.save(new Option(sq4, "Saturn", true));
        optionRepository.save(new Option(sq4, "Mars", false));
        optionRepository.save(new Option(sq4, "Mercury", false));

        // Q5: Closest star
        Question sq5 = new Question(spaceQuiz, "What is the closest star to Planet Earth?", null, Question.QuestionType.SINGLE_CHOICE);
        questionRepository.save(sq5);
        optionRepository.save(new Option(sq5, "Alpha Centauri", false));
        optionRepository.save(new Option(sq5, "Proxima Centauri", false));
        optionRepository.save(new Option(sq5, "The Sun", true));
        optionRepository.save(new Option(sq5, "Sirius", false));
    }
}

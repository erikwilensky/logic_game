class LogicGame {
    constructor() {
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.currentSection = null;
        this.questions = [];
        this.gameMode = 'practice';
        this.currentHintIndex = 0;
        this.isAnswered = false;
        this.truthTableBuilder = null;
        this.kmapBuilder = null;

        this.initializeElements();
        this.attachEventListeners();
        this.updateScoreDisplay();
        this.showModeSelector();
    }

    initializeElements() {
        this.elements = {
            modeSelector: document.getElementById('modeSelector'),
            gameArea: document.getElementById('gameArea'),
            questionSelector: document.getElementById('questionSelector'),
            questionTitle: document.getElementById('questionTitle'),
            questionNumber: document.getElementById('questionNumber'),
            totalQuestions: document.getElementById('totalQuestions'),
            difficulty: document.getElementById('difficulty'),
            questionContent: document.getElementById('questionContent'),
            questionInstructions: document.getElementById('questionInstructions'),
            answerSection: document.getElementById('answerSection'),
            hintBtn: document.getElementById('hintBtn'),
            checkBtn: document.getElementById('checkBtn'),
            nextBtn: document.getElementById('nextBtn'),
            showSolutionBtn: document.getElementById('showSolutionBtn'),
            hintPanel: document.getElementById('hintPanel'),
            hintText: document.getElementById('hintText'),
            feedbackPanel: document.getElementById('feedbackPanel'),
            feedbackTitle: document.getElementById('feedbackTitle'),
            feedbackContent: document.getElementById('feedbackContent'),
            explanationPanel: document.getElementById('explanationPanel'),
            explanationContent: document.getElementById('explanationContent'),
            score: document.getElementById('score'),
            progress: document.getElementById('progress'),
            accuracy: document.getElementById('accuracy'),
            categoryList: document.getElementById('categoryList')
        };
    }

    attachEventListeners() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.gameMode = e.target.dataset.mode;
                this.showQuestionSelector();
            });
        });

        this.elements.hintBtn.addEventListener('click', () => this.showHint());
        this.elements.checkBtn.addEventListener('click', () => this.checkAnswer());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.elements.showSolutionBtn.addEventListener('click', () => this.showSolution());
    }

    showModeSelector() {
        this.elements.modeSelector.style.display = 'block';
        this.elements.gameArea.style.display = 'none';
        this.elements.questionSelector.style.display = 'none';
    }

    showQuestionSelector() {
        this.elements.modeSelector.style.display = 'none';
        this.elements.gameArea.style.display = 'none';
        this.elements.questionSelector.style.display = 'block';

        this.elements.categoryList.innerHTML = '';

        Object.keys(QUESTION_BANK).forEach(sectionKey => {
            const section = QUESTION_BANK[sectionKey];
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <h3>${section.name}</h3>
                <p>${section.questions.length} questions</p>
            `;
            categoryItem.addEventListener('click', () => {
                this.startSection(sectionKey);
            });
            this.elements.categoryList.appendChild(categoryItem);
        });
    }

    startSection(sectionKey) {
        this.currentSection = sectionKey;
        this.questions = [...QUESTION_BANK[sectionKey].questions];
        this.currentQuestionIndex = 0;
        this.loadQuestion(this.questions[0]);
    }

    loadQuestion(question) {
        this.currentQuestion = question;
        this.currentHintIndex = 0;
        this.isAnswered = false;

        this.elements.modeSelector.style.display = 'none';
        this.elements.questionSelector.style.display = 'none';
        this.elements.gameArea.style.display = 'block';

        this.elements.questionTitle.textContent = question.question;
        this.elements.questionNumber.textContent = this.currentQuestionIndex + 1;
        this.elements.totalQuestions.textContent = this.questions.length;

        const difficultyClass = question.difficulty || 'medium';
        this.elements.difficulty.textContent = difficultyClass.charAt(0).toUpperCase() + difficultyClass.slice(1);
        this.elements.difficulty.className = `difficulty ${difficultyClass}`;

        this.elements.questionContent.innerHTML = '';
        this.elements.answerSection.innerHTML = '';
        this.elements.hintPanel.style.display = 'none';
        this.elements.feedbackPanel.style.display = 'none';
        this.elements.explanationPanel.style.display = 'none';
        this.elements.hintBtn.style.display = 'inline-block';
        this.elements.checkBtn.style.display = 'inline-block';
        this.elements.nextBtn.style.display = 'none';
        this.elements.showSolutionBtn.style.display = 'none';

        this.renderQuestion(question);
    }

    renderQuestion(question) {
        const instructions = this.getInstructions(question.type);
        this.elements.questionInstructions.textContent = instructions;

        switch (question.type) {
            case 'truth_table':
                this.renderTruthTableQuestion(question);
                break;
            case 'expression_and_table':
                this.renderExpressionAndTableQuestion(question);
                break;
            case 'kmap_from_table':
            case 'kmap_from_description':
            case 'kmap_from_expression':
            case 'kmap_from_minterms':
            case 'kmap_simplify':
                this.renderKmapQuestion(question);
                break;
            case 'boss_fight':
                this.renderBossFightQuestion(question);
                break;
            default:
                this.elements.answerSection.innerHTML = '<p>Question type not supported</p>';
        }
    }

    getInstructions(type) {
        const instructions = {
            truth_table: 'Fill in the output column (Q) with 0 or 1 for each row.',
            expression_and_table: 'Write the Boolean expression and fill in the truth table.',
            kmap_from_table: 'Fill in the K-map cells based on the truth table. Click cells to toggle between 0, 1, and X.',
            kmap_from_description: 'Fill in the K-map cells based on the description. Click cells to toggle between 0, 1, and X.',
            kmap_from_expression: 'Build the truth table and K-map, then fill in the K-map cells.',
            kmap_from_minterms: 'Fill in the K-map cells for the given minterms. Click cells to toggle between 0, 1, and X.',
            kmap_simplify: 'Fill in the K-map and write the simplified expression.',
            boss_fight: 'Complete all parts: truth table, K-map, and simplification.'
        };
        return instructions[type] || 'Follow the instructions above.';
    }

    renderTruthTableQuestion(question) {
        const answerDiv = document.createElement('div');
        answerDiv.id = 'truthTableAnswer';
        this.elements.answerSection.appendChild(answerDiv);

        this.truthTableBuilder = new TruthTableBuilder('truthTableAnswer');
        this.truthTableBuilder.render(question);
    }

    renderExpressionAndTableQuestion(question) {
        const expressionDiv = document.createElement('div');
        expressionDiv.className = 'expression-input';
        expressionDiv.innerHTML = `
            <label>Boolean Expression:</label>
            <input type="text" id="expressionInput" placeholder="e.g., (A OR B) AND NOT C">
        `;
        this.elements.answerSection.appendChild(expressionDiv);

        const tableDiv = document.createElement('div');
        tableDiv.id = 'truthTableAnswer';
        this.elements.answerSection.appendChild(tableDiv);

        this.truthTableBuilder = new TruthTableBuilder('truthTableAnswer');
        this.truthTableBuilder.render(question);
    }

    renderKmapQuestion(question) {
        if (question.type === 'kmap_from_expression' && question.expression) {
            const tableDiv = document.createElement('div');
            tableDiv.id = 'truthTableAnswer';
            this.elements.answerSection.appendChild(tableDiv);

            this.truthTableBuilder = new TruthTableBuilder('truthTableAnswer');
            this.truthTableBuilder.render(question);
        }

        const kmapDiv = document.createElement('div');
        kmapDiv.id = 'kmapAnswer';
        this.elements.answerSection.appendChild(kmapDiv);

        this.kmapBuilder = new KarnaughMapBuilder('kmapAnswer');
        this.kmapBuilder.render(question);

        if (question.type === 'kmap_simplify') {
            const expressionDiv = document.createElement('div');
            expressionDiv.className = 'kmap-expression';
            expressionDiv.innerHTML = `
                <label>Simplified Expression:</label>
                <input type="text" id="kmapExpressionInput" placeholder="e.g., A OR B">
            `;
            this.elements.answerSection.appendChild(expressionDiv);
        }
    }

    renderBossFightQuestion(question) {
        const tableDiv = document.createElement('div');
        tableDiv.id = 'truthTableAnswer';
        this.elements.answerSection.appendChild(tableDiv);

        this.truthTableBuilder = new TruthTableBuilder('truthTableAnswer');
        this.truthTableBuilder.render(question);

        const kmapDiv = document.createElement('div');
        kmapDiv.id = 'kmapAnswer';
        this.elements.answerSection.appendChild(kmapDiv);

        this.kmapBuilder = new KarnaughMapBuilder('kmapAnswer');
        this.kmapBuilder.render(question);

        const expressionDiv = document.createElement('div');
        expressionDiv.className = 'kmap-expression';
        expressionDiv.innerHTML = `
            <label>Simplified Expression:</label>
            <input type="text" id="kmapExpressionInput" placeholder="e.g., (A AND NOT B) OR (B AND C)">
        `;
        this.elements.answerSection.appendChild(expressionDiv);
    }

    showHint() {
        if (!this.currentQuestion.hints || this.currentHintIndex >= this.currentQuestion.hints.length) {
            this.elements.hintText.textContent = 'No more hints available for this question.';
            return;
        }

        this.elements.hintPanel.style.display = 'block';
        this.elements.hintText.textContent = this.currentQuestion.hints[this.currentHintIndex];
        this.currentHintIndex++;
    }

    checkAnswer() {
        if (this.isAnswered) return;

        let result = { isCorrect: false, message: '' };

        switch (this.currentQuestion.type) {
            case 'truth_table':
                result = this.checkTruthTableAnswer();
                break;
            case 'expression_and_table':
                result = this.checkExpressionAndTableAnswer();
                break;
            case 'kmap_from_table':
            case 'kmap_from_description':
            case 'kmap_from_expression':
            case 'kmap_from_minterms':
                result = this.checkKmapAnswer();
                break;
            case 'kmap_simplify':
                result = this.checkKmapSimplifyAnswer();
                break;
            case 'boss_fight':
                result = this.checkBossFightAnswer();
                break;
        }

        this.isAnswered = true;
        this.showFeedback(result);
        this.updateScore(result.isCorrect);
    }

    checkTruthTableAnswer() {
        if (!this.truthTableBuilder) {
            return { isCorrect: false, message: 'Truth table not initialized' };
        }
        return this.truthTableBuilder.checkAnswer();
    }

    checkExpressionAndTableAnswer() {
        const expressionInput = document.getElementById('expressionInput');
        const userExpression = expressionInput ? expressionInput.value.trim().toUpperCase() : '';
        const expectedExpression = this.currentQuestion.expectedExpression.toUpperCase();

        let expressionCorrect = false;
        if (userExpression === expectedExpression || 
            this.normalizeExpression(userExpression) === this.normalizeExpression(expectedExpression)) {
            expressionCorrect = true;
        }

        const tableResult = this.truthTableBuilder ? this.truthTableBuilder.checkAnswer() : { isCorrect: false };

        return {
            isCorrect: expressionCorrect && tableResult.isCorrect,
            message: expressionCorrect && tableResult.isCorrect ? 'Correct!' : 'Incorrect. Check your expression and truth table.',
            expressionCorrect,
            tableCorrect: tableResult.isCorrect
        };
    }

    normalizeExpression(expr) {
        return expr.replace(/\s+/g, ' ').trim();
    }

    checkKmapAnswer() {
        if (!this.kmapBuilder) {
            return { isCorrect: false, message: 'K-map not initialized' };
        }
        return this.kmapBuilder.checkAnswer(this.currentQuestion.answer?.kmap);
    }

    checkKmapSimplifyAnswer() {
        const kmapResult = this.checkKmapAnswer();
        const expressionInput = document.getElementById('kmapExpressionInput');
        const userExpression = expressionInput ? expressionInput.value.trim().toUpperCase() : '';
        const expectedExpression = (this.currentQuestion.answer?.expression || '').toUpperCase();

        let expressionCorrect = false;
        if (userExpression && expectedExpression) {
            expressionCorrect = this.normalizeExpression(userExpression) === this.normalizeExpression(expectedExpression);
        }

        return {
            isCorrect: kmapResult.isCorrect && expressionCorrect,
            message: kmapResult.isCorrect && expressionCorrect ? 'Correct!' : 'Check your K-map and expression.',
            kmapCorrect: kmapResult.isCorrect,
            expressionCorrect
        };
    }

    checkBossFightAnswer() {
        const tableResult = this.checkTruthTableAnswer();
        const kmapResult = this.checkKmapAnswer();
        const expressionInput = document.getElementById('kmapExpressionInput');
        const userExpression = expressionInput ? expressionInput.value.trim().toUpperCase() : '';
        const expectedExpression = (this.currentQuestion.answer?.simplifiedExpression || '').toUpperCase();

        let expressionCorrect = false;
        if (userExpression && expectedExpression) {
            expressionCorrect = this.normalizeExpression(userExpression) === this.normalizeExpression(expectedExpression);
        }

        const allCorrect = tableResult.isCorrect && kmapResult.isCorrect && expressionCorrect;

        return {
            isCorrect: allCorrect,
            message: allCorrect ? 'Perfect! All parts are correct.' : 'Some parts are incorrect. Review your answers.',
            tableCorrect: tableResult.isCorrect,
            kmapCorrect: kmapResult.isCorrect,
            expressionCorrect
        };
    }

    showFeedback(result) {
        this.elements.feedbackPanel.style.display = 'block';
        this.elements.feedbackPanel.className = 'feedback-panel ' + (result.isCorrect ? 'success' : 'error');
        this.elements.feedbackTitle.textContent = result.isCorrect ? 'Correct!' : 'Incorrect';
        this.elements.feedbackContent.innerHTML = `<p>${result.message}</p>`;

        if (result.isCorrect) {
            this.elements.checkBtn.style.display = 'none';
            this.elements.nextBtn.style.display = 'inline-block';
        } else {
            this.elements.showSolutionBtn.style.display = 'inline-block';
        }

        if (this.currentQuestion.explanation) {
            setTimeout(() => {
                this.showExplanation();
            }, 1000);
        }
    }

    showExplanation() {
        this.elements.explanationPanel.style.display = 'block';
        this.elements.explanationContent.innerHTML = `<p>${this.currentQuestion.explanation}</p>`;
    }

    showSolution() {
        if (this.truthTableBuilder) {
            this.truthTableBuilder.showAnswer();
        }
        if (this.kmapBuilder && this.currentQuestion.answer?.kmap) {
            this.kmapBuilder.setKmapData(this.currentQuestion.answer.kmap.values);
        }
        const expressionInput = document.getElementById('kmapExpressionInput');
        if (expressionInput && this.currentQuestion.answer?.expression) {
            expressionInput.value = this.currentQuestion.answer.expression;
        }
        const exprInput = document.getElementById('expressionInput');
        if (exprInput && this.currentQuestion.expectedExpression) {
            exprInput.value = this.currentQuestion.expectedExpression;
        }
    }

    updateScore(isCorrect) {
        const result = scoringSystem.submitAnswer(
            this.currentQuestion.id,
            isCorrect,
            this.currentQuestion.difficulty || 'medium'
        );
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const progress = scoringSystem.getProgress();
        this.elements.score.textContent = progress.score;
        this.elements.progress.textContent = `${progress.completed}/${progress.total}`;
        this.elements.accuracy.textContent = `${progress.accuracy}%`;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.loadQuestion(this.questions[this.currentQuestionIndex]);
        } else {
            alert('You have completed all questions in this section!');
            this.showQuestionSelector();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new LogicGame();
});


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
        this.timer = null;
        this.timeRemaining = 0;
        this.modeStartTime = null;
        this.currentSectionTotal = 0;
        this.currentSectionCompleted = 0;

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
            categoryList: document.getElementById('categoryList'),
            timerDisplay: document.getElementById('timerDisplay'),
            timerContainer: document.getElementById('timerContainer'),
            backBtn: document.getElementById('backBtn')
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
        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', () => this.showQuestionSelector());
        }
    }

    showModeSelector() {
        this.elements.modeSelector.style.display = 'block';
        this.elements.gameArea.style.display = 'none';
        this.elements.questionSelector.style.display = 'none';
    }

    showQuestionSelector() {
        // Stop timer if running
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.elements.timerContainer) {
            this.elements.timerContainer.style.display = 'none';
        }
        
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
        this.currentSectionTotal = this.questions.length;
        this.currentSectionCompleted = 0;
        
        // Reset mode-specific scoring if switching modes
        if (this.gameMode === 'timed' || this.gameMode === 'exam') {
            this.startTimer();
        }
        
        this.loadQuestion(this.questions[0]);
    }
    
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        if (this.gameMode === 'timed') {
            this.timeRemaining = 30 * 60; // 30 minutes
        } else if (this.gameMode === 'exam') {
            this.timeRemaining = 60 * 60; // 60 minutes
        } else {
            // Practice mode - no timer
            if (this.elements.timerContainer) {
                this.elements.timerContainer.style.display = 'none';
            }
            return;
        }
        
        if (this.elements.timerContainer) {
            this.elements.timerContainer.style.display = 'flex';
        }
        
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        if (!this.elements.timerDisplay) return;
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (this.timeRemaining < 300) { // Less than 5 minutes
            this.elements.timerDisplay.style.color = 'var(--error-color)';
        } else {
            this.elements.timerDisplay.style.color = '';
        }
    }
    
    timeUp() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        alert('Time is up! Your progress has been saved.');
        this.showQuestionSelector();
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
        this.elements.totalQuestions.textContent = this.currentSectionTotal;

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
            expression_and_table: 'Write the Boolean expression and fill in the truth table. Use operators: AND, OR, NOT, XOR.',
            kmap_from_table: 'Fill in the K-map cells based on the truth table. Click cells to toggle: 0 → 1 → X → 0. X means don\'t-care.',
            kmap_from_description: 'Fill in the K-map cells based on the description. Click cells to toggle: 0 → 1 → X → 0. X means don\'t-care.',
            kmap_from_expression: 'Build the truth table and K-map, then fill in the K-map cells. Click cells to toggle: 0 → 1 → X → 0.',
            kmap_from_minterms: 'Fill in the K-map cells for the given minterms. Click cells to toggle: 0 → 1 → X → 0. X means don\'t-care.',
            kmap_simplify: 'Fill in the K-map and write the simplified expression. Use operators: AND, OR, NOT.',
            boss_fight: 'Complete all parts: truth table, K-map, and simplification. Click K-map cells to toggle: 0 → 1 → X → 0.'
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

        if (question.type === 'kmap_simplify' || question.type === 'kmap_from_expression' || question.type === 'kmap_from_minterms') {
            const expressionDiv = document.createElement('div');
            expressionDiv.className = 'kmap-expression';
            expressionDiv.innerHTML = `
                <label>Simplified Expression:</label>
                <input type="text" id="kmapExpressionInput" placeholder="e.g., A OR B" style="color: var(--text-color); background: white; border: 2px solid var(--border-color); padding: 12px; font-size: 1.1em; width: 100%; max-width: 500px; border-radius: 4px;">
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
            <input type="text" id="kmapExpressionInput" placeholder="e.g., (A AND NOT B) OR (B AND C)" style="color: var(--text-color); background: white; border: 2px solid var(--border-color); padding: 12px; font-size: 1.1em; width: 100%; max-width: 500px; border-radius: 4px;">
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
        if (!expr) return '';
        // Normalize whitespace
        let normalized = expr.replace(/\s+/g, ' ').trim().toUpperCase();
        // Handle common variations
        normalized = normalized.replace(/\bAND\b/g, 'AND');
        normalized = normalized.replace(/\bOR\b/g, 'OR');
        normalized = normalized.replace(/\bNOT\b/g, 'NOT');
        normalized = normalized.replace(/\bXOR\b/g, 'XOR');
        // Remove extra spaces around operators
        normalized = normalized.replace(/\s*\(\s*/g, '(');
        normalized = normalized.replace(/\s*\)\s*/g, ')');
        return normalized;
    }
    
    expressionsEquivalent(expr1, expr2) {
        const norm1 = this.normalizeExpression(expr1);
        const norm2 = this.normalizeExpression(expr2);
        
        // Exact match
        if (norm1 === norm2) return true;
        
        // Try some common equivalences
        // (A AND B) OR (A AND C) = A AND (B OR C)
        // But this is complex, so for now just do exact match
        return false;
    }

    checkKmapAnswer() {
        if (!this.kmapBuilder) {
            return { isCorrect: false, message: 'K-map not initialized' };
        }
        // Handle both 2-input and 3-input K-map formats
        const expectedKmap = this.currentQuestion.answer?.kmap || this.currentQuestion.answer;
        return this.kmapBuilder.checkAnswer(expectedKmap);
    }

    checkKmapSimplifyAnswer() {
        const kmapResult = this.checkKmapAnswer();
        const expressionInput = document.getElementById('kmapExpressionInput');
        const userExpression = expressionInput ? expressionInput.value.trim() : '';
        const expectedExpression = this.currentQuestion.answer?.expression || '';

        let expressionCorrect = false;
        if (userExpression && expectedExpression) {
            const normalizedUser = this.normalizeExpression(userExpression);
            const normalizedExpected = this.normalizeExpression(expectedExpression);
            expressionCorrect = normalizedUser === normalizedExpected;
            
            // If not exact match, provide helpful feedback
            if (!expressionCorrect && kmapResult.isCorrect) {
                return {
                    isCorrect: false,
                    message: `K-map is correct, but expression doesn't match. Expected: ${expectedExpression}`,
                    kmapCorrect: true,
                    expressionCorrect: false
                };
            }
        }

        return {
            isCorrect: kmapResult.isCorrect && expressionCorrect,
            message: kmapResult.isCorrect && expressionCorrect ? 'Correct!' : 
                    (!kmapResult.isCorrect ? 'Check your K-map.' : 'Check your expression.'),
            kmapCorrect: kmapResult.isCorrect,
            expressionCorrect
        };
    }

    checkBossFightAnswer() {
        const tableResult = this.checkTruthTableAnswer();
        const kmapResult = this.checkKmapAnswer();
        const expressionInput = document.getElementById('kmapExpressionInput');
        const userExpression = expressionInput ? expressionInput.value.trim() : '';
        const expectedExpression = this.currentQuestion.answer?.simplifiedExpression || this.currentQuestion.answer?.expression || '';

        let expressionCorrect = false;
        if (userExpression && expectedExpression) {
            expressionCorrect = this.normalizeExpression(userExpression) === this.normalizeExpression(expectedExpression);
        }

        const allCorrect = tableResult.isCorrect && kmapResult.isCorrect && expressionCorrect;
        
        // Provide detailed feedback
        let message = '';
        if (allCorrect) {
            message = 'Perfect! All parts are correct.';
        } else {
            const parts = [];
            if (!tableResult.isCorrect) parts.push('truth table');
            if (!kmapResult.isCorrect) parts.push('K-map');
            if (!expressionCorrect) parts.push('expression');
            message = `Some parts are incorrect: ${parts.join(', ')}. Review your answers.`;
        }

        return {
            isCorrect: allCorrect,
            message: message,
            tableCorrect: tableResult.isCorrect,
            kmapCorrect: kmapResult.isCorrect,
            expressionCorrect
        };
    }

    showFeedback(result) {
        this.elements.feedbackPanel.style.display = 'block';
        this.elements.feedbackPanel.className = 'feedback-panel ' + (result.isCorrect ? 'success' : 'error');
        this.elements.feedbackTitle.textContent = result.isCorrect ? 'Correct!' : 'Incorrect';
        const message = result.message || (result.isCorrect ? 'Well done!' : 'Please try again.');
        this.elements.feedbackContent.innerHTML = `<p>${message}</p>`;

        if (result.isCorrect) {
            this.elements.checkBtn.style.display = 'none';
            this.elements.nextBtn.style.display = 'inline-block';
        } else {
            this.elements.showSolutionBtn.style.display = 'inline-block';
        }

        // Don't auto-show explanation - user can check solution if needed
        // if (this.currentQuestion.explanation) {
        //     setTimeout(() => {
        //         this.showExplanation();
        //     }, 1000);
        // }
    }

    showExplanation() {
        this.elements.explanationPanel.style.display = 'block';
        let explanationText = this.currentQuestion.explanation || '';
        
        // Remove any expression from explanation if it contains one
        // Don't reveal the answer in the explanation
        explanationText = explanationText.replace(/The simplified expression is [^.]*\./gi, '');
        explanationText = explanationText.replace(/This simplifies to [^.]*\./gi, '');
        explanationText = explanationText.replace(/is [A-Z0-9\s\(\)ANDORNOTXOR]+\./gi, '');
        explanationText = explanationText.replace(/expression [A-Z0-9\s\(\)ANDORNOTXOR]+/gi, 'expression');
        explanationText = explanationText.replace(/represents [A-Z0-9\s\(\)ANDORNOTXOR]+/gi, 'represents a simplified form');
        explanationText = explanationText.replace(/This represents [A-Z0-9\s\(\)ANDORNOTXOR]+/gi, 'This represents a simplified form');
        
        this.elements.explanationContent.innerHTML = `<p>${explanationText}</p>`;
    }

    showSolution() {
        if (this.truthTableBuilder) {
            this.truthTableBuilder.showAnswer();
        }
        if (this.kmapBuilder && this.currentQuestion.answer?.kmap) {
            const kmap = this.currentQuestion.answer.kmap;
            if (kmap.values) {
                this.kmapBuilder.setKmapData(kmap.values);
            } else if (Array.isArray(kmap)) {
                this.kmapBuilder.setKmapData(kmap);
            }
        }
        const expressionInput = document.getElementById('kmapExpressionInput');
        if (expressionInput) {
            // Don't auto-fill the expression - user should figure it out themselves
            // The "Show Solution" button will reveal it if they need help
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
        if (isCorrect) {
            this.currentSectionCompleted++;
        }
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const progress = scoringSystem.getProgress();
        this.elements.score.textContent = progress.score;
        // Show section progress instead of global progress
        this.elements.progress.textContent = `${this.currentSectionCompleted}/${this.currentSectionTotal}`;
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


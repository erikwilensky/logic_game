const SCORING_CONFIG = {
    pointsPerQuestion: {
        easy: 10,
        medium: 20,
        hard: 30
    },
    streakBonus: {
        threshold: 3,
        bonus: 5
    }
};

class ScoringSystem {
    constructor() {
        this.score = 0;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.completedQuestions = new Set();
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('logicGameScore');
            if (saved) {
                const data = JSON.parse(saved);
                this.score = data.score || 0;
                this.totalQuestions = data.totalQuestions || 0;
                this.correctAnswers = data.correctAnswers || 0;
                this.currentStreak = data.currentStreak || 0;
                this.maxStreak = data.maxStreak || 0;
                this.completedQuestions = new Set(data.completedQuestions || []);
            }
        } catch (e) {
            console.error('Error loading score from storage:', e);
        }
    }

    saveToStorage() {
        try {
            const data = {
                score: this.score,
                totalQuestions: this.totalQuestions,
                correctAnswers: this.correctAnswers,
                currentStreak: this.currentStreak,
                maxStreak: this.maxStreak,
                completedQuestions: Array.from(this.completedQuestions)
            };
            localStorage.setItem('logicGameScore', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving score to storage:', e);
        }
    }

    submitAnswer(questionId, isCorrect, difficulty) {
        if (this.completedQuestions.has(questionId)) {
            return { alreadyCompleted: true };
        }

        this.totalQuestions++;
        this.completedQuestions.add(questionId);

        let pointsEarned = 0;
        if (isCorrect) {
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.maxStreak) {
                this.maxStreak = this.currentStreak;
            }

            pointsEarned = SCORING_CONFIG.pointsPerQuestion[difficulty] || 10;

            if (this.currentStreak >= SCORING_CONFIG.streakBonus.threshold) {
                pointsEarned += SCORING_CONFIG.streakBonus.bonus;
            }
        } else {
            this.currentStreak = 0;
        }

        this.score += pointsEarned;
        this.saveToStorage();

        return {
            pointsEarned,
            isCorrect,
            currentStreak: this.currentStreak,
            maxStreak: this.maxStreak,
            accuracy: this.getAccuracy()
        };
    }

    getAccuracy() {
        if (this.totalQuestions === 0) return 0;
        return Math.round((this.correctAnswers / this.totalQuestions) * 100);
    }

    getProgress() {
        return {
            completed: this.completedQuestions.size,
            total: this.totalQuestions,
            score: this.score,
            accuracy: this.getAccuracy(),
            currentStreak: this.currentStreak,
            maxStreak: this.maxStreak
        };
    }

    reset() {
        this.score = 0;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.completedQuestions.clear();
        this.saveToStorage();
    }

    isQuestionCompleted(questionId) {
        return this.completedQuestions.has(questionId);
    }
}

const scoringSystem = new ScoringSystem();


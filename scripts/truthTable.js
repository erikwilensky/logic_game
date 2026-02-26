class BooleanExpressionParser {
    constructor() {
        this.operators = {
            'AND': { precedence: 2, associativity: 'left' },
            'OR': { precedence: 1, associativity: 'left' },
            'XOR': { precedence: 1, associativity: 'left' },
            'NAND': { precedence: 2, associativity: 'left' },
            'NOR': { precedence: 1, associativity: 'left' },
            'NOT': { precedence: 3, associativity: 'right' }
        };
    }

    tokenize(expression) {
        const tokens = [];
        const regex = /\b(AND|OR|XOR|NAND|NOR|NOT)\b|\(|\)|[A-Z]\w*/gi;
        let match;
        let lastIndex = 0;

        while ((match = regex.exec(expression)) !== null) {
            if (match.index > lastIndex) {
                const text = expression.substring(lastIndex, match.index).trim();
                if (text) tokens.push({ type: 'text', value: text });
            }

            const value = match[0].toUpperCase();
            if (this.operators[value]) {
                tokens.push({ type: 'operator', value: value });
            } else if (value === '(') {
                tokens.push({ type: 'lparen', value: '(' });
            } else if (value === ')') {
                tokens.push({ type: 'rparen', value: ')' });
            } else {
                tokens.push({ type: 'variable', value: value });
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < expression.length) {
            const text = expression.substring(lastIndex).trim();
            if (text) tokens.push({ type: 'text', value: text });
        }

        return tokens;
    }

    shuntingYard(tokens) {
        const output = [];
        const operators = [];

        for (const token of tokens) {
            if (token.type === 'variable') {
                output.push(token);
            } else if (token.type === 'operator') {
                const op = this.operators[token.value];
                while (operators.length > 0) {
                    const top = operators[operators.length - 1];
                    if (top.type !== 'operator') break;
                    const topOp = this.operators[top.value];
                    if ((op.associativity === 'left' && op.precedence <= topOp.precedence) ||
                        (op.associativity === 'right' && op.precedence < topOp.precedence)) {
                        output.push(operators.pop());
                    } else {
                        break;
                    }
                }
                operators.push(token);
            } else if (token.type === 'lparen') {
                operators.push(token);
            } else if (token.type === 'rparen') {
                while (operators.length > 0 && operators[operators.length - 1].type !== 'lparen') {
                    output.push(operators.pop());
                }
                operators.pop();
            }
        }

        while (operators.length > 0) {
            output.push(operators.pop());
        }

        return output;
    }

    evaluateRPN(rpn, values) {
        const stack = [];

        for (const token of rpn) {
            if (token.type === 'variable') {
                const varName = token.value.charAt(0);
                stack.push(values[varName] || 0);
            } else if (token.type === 'operator') {
                const op = token.value;
                if (op === 'NOT') {
                    const a = stack.pop();
                    stack.push(a === 0 ? 1 : 0);
                } else {
                    const b = stack.pop();
                    const a = stack.pop();
                    let result;

                    switch (op) {
                        case 'AND':
                            result = (a === 1 && b === 1) ? 1 : 0;
                            break;
                        case 'OR':
                            result = (a === 1 || b === 1) ? 1 : 0;
                            break;
                        case 'XOR':
                            result = (a !== b) ? 1 : 0;
                            break;
                        case 'NAND':
                            result = (a === 1 && b === 1) ? 0 : 1;
                            break;
                        case 'NOR':
                            result = (a === 0 && b === 0) ? 1 : 0;
                            break;
                        default:
                            result = 0;
                    }
                    stack.push(result);
                }
            }
        }

        return stack.pop() || 0;
    }

    evaluate(expression, values) {
        try {
            const tokens = this.tokenize(expression);
            const rpn = this.shuntingYard(tokens);
            return this.evaluateRPN(rpn, values);
        } catch (e) {
            console.error('Error evaluating expression:', e);
            return 0;
        }
    }

    generateTruthTable(expression, inputs) {
        const numInputs = inputs.length;
        const numRows = Math.pow(2, numInputs);
        const table = [];

        for (let i = 0; i < numRows; i++) {
            const row = [];
            const values = {};

            for (let j = 0; j < numInputs; j++) {
                const bit = (i >> (numInputs - 1 - j)) & 1;
                row.push(bit);
                values[inputs[j]] = bit;
            }

            const output = this.evaluate(expression, values);
            row.push(output);
            table.push(row);
        }

        return table;
    }
}

class TruthTableBuilder {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.parser = new BooleanExpressionParser();
        this.userAnswers = [];
        this.correctAnswers = [];
        this.onChangeCallback = null;
    }

    render(question) {
        this.container.innerHTML = '';
        this.userAnswers = [];
        this.correctAnswers = [];

        const inputs = question.inputs || [];
        const numInputs = inputs.length;
        let expectedTable;

        if (question.answer && question.answer.table) {
            expectedTable = question.answer.table;
        } else if (question.expression) {
            expectedTable = this.parser.generateTruthTable(question.expression, inputs);
        } else {
            expectedTable = [];
        }

        this.correctAnswers = expectedTable.map(row => row[row.length - 1]);

        const table = document.createElement('table');
        table.className = 'truth-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        inputs.forEach(input => {
            const th = document.createElement('th');
            th.textContent = input;
            headerRow.appendChild(th);
        });

        const outputTh = document.createElement('th');
        outputTh.textContent = 'Q';
        headerRow.appendChild(outputTh);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const numRows = Math.pow(2, numInputs);

        for (let i = 0; i < numRows; i++) {
            const row = document.createElement('tr');
            const inputValues = [];

            for (let j = 0; j < numInputs; j++) {
                const td = document.createElement('td');
                td.className = 'input-cell';
                const bit = (i >> (numInputs - 1 - j)) & 1;
                td.textContent = bit;
                inputValues.push(bit);
                row.appendChild(td);
            }

            const outputTd = document.createElement('td');
            outputTd.className = 'output-cell';
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.rowIndex = i;
            input.value = '';

            input.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value === '0' || value === '1') {
                    this.userAnswers[i] = parseInt(value);
                    e.target.classList.remove('correct', 'incorrect');
                    if (this.onChangeCallback) {
                        this.onChangeCallback();
                    }
                } else if (value === '') {
                    delete this.userAnswers[i];
                    e.target.classList.remove('correct', 'incorrect');
                } else {
                    e.target.value = '';
                }
            });

            outputTd.appendChild(input);
            row.appendChild(outputTd);
            tbody.appendChild(row);
            this.userAnswers.push(null);
        }

        table.appendChild(tbody);
        this.container.appendChild(table);
    }

    checkAnswer() {
        let allCorrect = true;
        const inputs = this.container.querySelectorAll('input[type="text"]');

        inputs.forEach((input, index) => {
            const userAnswer = this.userAnswers[index];
            const correctAnswer = this.correctAnswers[index];

            input.classList.remove('correct', 'incorrect');

            if (userAnswer === null || userAnswer === undefined) {
                allCorrect = false;
            } else if (userAnswer === correctAnswer) {
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
                allCorrect = false;
            }
        });

        return {
            isCorrect: allCorrect,
            userAnswers: [...this.userAnswers],
            correctAnswers: [...this.correctAnswers]
        };
    }

    showAnswer() {
        const inputs = this.container.querySelectorAll('input[type="text"]');
        inputs.forEach((input, index) => {
            input.value = this.correctAnswers[index];
            input.classList.add('correct');
        });
    }

    getUserAnswers() {
        return this.userAnswers;
    }

    setOnChange(callback) {
        this.onChangeCallback = callback;
    }
}


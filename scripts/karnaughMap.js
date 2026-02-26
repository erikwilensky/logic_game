class KarnaughMapBuilder {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.numInputs = 2;
        this.kmapData = [];
        this.groups = [];
        this.isGroupingMode = false;
        this.currentGroup = null;
        this.onChangeCallback = null;
    }

    getGrayCodeOrder(n) {
        if (n === 1) return ['0', '1'];
        if (n === 2) return ['00', '01', '11', '10'];
        if (n === 3) return ['000', '001', '011', '010', '110', '111', '101', '100'];
        return [];
    }

    render(question) {
        this.container.innerHTML = '';
        this.groups = [];
        this.isGroupingMode = false;

        const inputs = question.inputs || ['A', 'B'];
        this.numInputs = inputs.length;

        if (this.numInputs === 2) {
            this.render2Input(inputs, question);
        } else if (this.numInputs === 3) {
            this.render3Input(inputs, question);
        } else {
            this.container.textContent = 'K-maps with more than 3 inputs are not yet supported.';
            return;
        }
    }

    render2Input(inputs, question) {
        const wrapper = document.createElement('div');
        wrapper.className = 'kmap-container';

        const labels = document.createElement('div');
        labels.className = 'kmap-labels';
        labels.innerHTML = `<div style="width: 60px;"></div><div class="kmap-col-labels"><div class="kmap-col-label">0</div><div class="kmap-col-label">1</div></div>`;
        wrapper.appendChild(labels);

        // Initialize with proper structure - ensure all cells exist
        this.kmapData = [[0, 0], [0, 0]];

        if (question.answer && question.answer.kmap) {
            const kmap = question.answer.kmap;
            if (Array.isArray(kmap) && Array.isArray(kmap[0])) {
                // Ensure we have the right structure
                this.kmapData = kmap.map(row => {
                    const newRow = [0, 0];
                    if (Array.isArray(row)) {
                        for (let i = 0; i < Math.min(row.length, 2); i++) {
                            newRow[i] = row[i] !== null && row[i] !== undefined ? row[i] : 0;
                        }
                    }
                    return newRow;
                });
            }
        } else if (question.truthTable) {
            this.populateFromTruthTable(question.truthTable, 2);
        } else if (question.minterms) {
            this.populateFromMinterms(question.minterms, 2);
        }
        
        // Ensure we always have 2 rows and 2 columns
        if (this.kmapData.length < 2) {
            this.kmapData.push([0, 0]);
        }
        for (let i = 0; i < this.kmapData.length; i++) {
            if (!Array.isArray(this.kmapData[i]) || this.kmapData[i].length < 2) {
                const newRow = [0, 0];
                if (Array.isArray(this.kmapData[i])) {
                    for (let j = 0; j < Math.min(this.kmapData[i].length, 2); j++) {
                        newRow[j] = this.kmapData[i][j] !== null && this.kmapData[i][j] !== undefined ? this.kmapData[i][j] : 0;
                    }
                }
                this.kmapData[i] = newRow;
            }
        }

        const rowLabels = ['0', '1'];
        rowLabels.forEach((rowLabel, rowIdx) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'kmap-row';

            const label = document.createElement('div');
            label.className = 'kmap-row-label';
            label.textContent = inputs[0] + '=' + rowLabel;
            rowDiv.appendChild(label);

            [0, 1].forEach((colIdx) => {
                // Ensure data exists before accessing
                if (!this.kmapData[rowIdx]) {
                    this.kmapData[rowIdx] = [0, 0];
                }
                if (this.kmapData[rowIdx][colIdx] === null || this.kmapData[rowIdx][colIdx] === undefined) {
                    this.kmapData[rowIdx][colIdx] = 0;
                }
                const cell = this.createCell(rowIdx, colIdx, this.kmapData[rowIdx][colIdx]);
                rowDiv.appendChild(cell);
            });

            wrapper.appendChild(rowDiv);
        });

        this.container.appendChild(wrapper);
    }

    render3Input(inputs, question) {
        const wrapper = document.createElement('div');
        wrapper.className = 'kmap-container';

        const colLabels = this.getGrayCodeOrder(2);
        const labels = document.createElement('div');
        labels.className = 'kmap-labels';
        const colLabelsDiv = document.createElement('div');
        colLabelsDiv.className = 'kmap-col-labels';
        colLabels.forEach(label => {
            const div = document.createElement('div');
            div.className = 'kmap-col-label';
            div.textContent = label;
            colLabelsDiv.appendChild(div);
        });
        labels.innerHTML = `<div style="width: 60px;"></div>`;
        labels.appendChild(colLabelsDiv);
        wrapper.appendChild(labels);

        // Initialize with proper structure - ensure all cells exist
        this.kmapData = [
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        if (question.answer && question.answer.kmap) {
            const kmap = question.answer.kmap;
            if (kmap.values) {
                // Ensure we have the right structure
                this.kmapData = kmap.values.map(row => {
                    const newRow = [0, 0, 0, 0];
                    for (let i = 0; i < Math.min(row.length, 4); i++) {
                        newRow[i] = row[i] !== null && row[i] !== undefined ? row[i] : 0;
                    }
                    return newRow;
                });
            } else if (Array.isArray(kmap)) {
                // Handle 2D array format directly
                this.kmapData = kmap.map(row => {
                    const newRow = [0, 0, 0, 0];
                    if (Array.isArray(row)) {
                        for (let i = 0; i < Math.min(row.length, 4); i++) {
                            newRow[i] = row[i] !== null && row[i] !== undefined ? row[i] : 0;
                        }
                    }
                    return newRow;
                });
            }
        } else if (question.truthTable) {
            this.populateFromTruthTable(question.truthTable, 3);
        } else if (question.minterms) {
            this.populateFromMinterms(question.minterms, 3);
        }
        
        // Ensure we always have 2 rows and 4 columns
        if (this.kmapData.length < 2) {
            this.kmapData.push([0, 0, 0, 0]);
        }
        for (let i = 0; i < this.kmapData.length; i++) {
            if (!Array.isArray(this.kmapData[i]) || this.kmapData[i].length < 4) {
                const newRow = [0, 0, 0, 0];
                if (Array.isArray(this.kmapData[i])) {
                    for (let j = 0; j < Math.min(this.kmapData[i].length, 4); j++) {
                        newRow[j] = this.kmapData[i][j] !== null && this.kmapData[i][j] !== undefined ? this.kmapData[i][j] : 0;
                    }
                }
                this.kmapData[i] = newRow;
            }
        }

        const rowLabels = ['0', '1'];
        rowLabels.forEach((rowIdx) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'kmap-row';

            const label = document.createElement('div');
            label.className = 'kmap-row-label';
            label.textContent = inputs[0] + '=' + rowIdx;
            rowDiv.appendChild(label);

            colLabels.forEach((colLabel, colIdx) => {
                const rowNum = parseInt(rowIdx);
                // Ensure data exists before accessing
                if (!this.kmapData[rowNum]) {
                    this.kmapData[rowNum] = [0, 0, 0, 0];
                }
                if (this.kmapData[rowNum][colIdx] === null || this.kmapData[rowNum][colIdx] === undefined) {
                    this.kmapData[rowNum][colIdx] = 0;
                }
                const cell = this.createCell(rowNum, colIdx, this.kmapData[rowNum][colIdx]);
                rowDiv.appendChild(cell);
            });

            wrapper.appendChild(rowDiv);
        });

        this.container.appendChild(wrapper);
    }

    createCell(row, col, initialValue) {
        const cell = document.createElement('div');
        cell.className = 'kmap-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Ensure we have a valid value
        let value = initialValue;
        if (value === null || value === undefined || value === '') {
            value = 0;
        }
        
        // Ensure the kmapData array has this cell
        if (!this.kmapData[row]) {
            this.kmapData[row] = [];
        }
        if (this.kmapData[row][col] === null || this.kmapData[row][col] === undefined) {
            this.kmapData[row][col] = value;
        }

        this.updateCellAppearance(cell, value);
        cell.textContent = value === 'X' || value === 'x' ? 'X' : value;

        cell.addEventListener('click', () => {
            this.toggleCell(cell);
        });

        return cell;
    }

    updateCellAppearance(cell, value) {
        cell.classList.remove('value-0', 'value-1', 'value-x', 'grouped');
        if (value === 'X' || value === 'x') {
            cell.classList.add('value-x');
        } else if (value === 1) {
            cell.classList.add('value-1');
        } else {
            cell.classList.add('value-0');
        }
    }

    toggleCell(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        let currentValue = this.kmapData[row][col];

        if (currentValue === null || currentValue === undefined) currentValue = 0;

        if (currentValue === 0) {
            currentValue = 1;
        } else if (currentValue === 1) {
            currentValue = 'X';
        } else {
            currentValue = 0;
        }

        this.kmapData[row][col] = currentValue;
        this.updateCellAppearance(cell, currentValue);
        cell.textContent = currentValue === 'X' || currentValue === 'x' ? 'X' : currentValue;

        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    populateFromTruthTable(truthTable, numInputs) {
        if (numInputs === 2) {
            this.kmapData[0][0] = truthTable[0][2];
            this.kmapData[0][1] = truthTable[1][2];
            this.kmapData[1][0] = truthTable[2][2];
            this.kmapData[1][1] = truthTable[3][2];
        } else if (numInputs === 3) {
            const mapping = [
                [0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0],
                [1, 1, 0], [1, 1, 1], [1, 0, 1], [1, 0, 0]
            ];
            mapping.forEach((bits, idx) => {
                const row = bits[0];
                const bc = bits.slice(1).join('');
                const colMap = { '00': 0, '01': 1, '11': 2, '10': 3 };
                const col = colMap[bc];
                const output = truthTable[idx][3];
                this.kmapData[row][col] = output;
            });
        }
    }

    populateFromMinterms(minterms, numInputs) {
        const numRows = Math.pow(2, numInputs);
        
        if (numInputs === 2) {
            for (let i = 0; i < numRows; i++) {
                const row = (i >> 1) & 1;
                const col = i & 1;
                this.kmapData[row][col] = minterms.includes(i) ? 1 : 0;
            }
        } else if (numInputs === 3) {
            const mintermToKmap = [
                { minterm: 0, row: 0, col: 0 }, // A=0, BC=00
                { minterm: 1, row: 0, col: 1 }, // A=0, BC=01
                { minterm: 3, row: 0, col: 2 }, // A=0, BC=11
                { minterm: 2, row: 0, col: 3 }, // A=0, BC=10
                { minterm: 4, row: 1, col: 0 }, // A=1, BC=00
                { minterm: 5, row: 1, col: 1 }, // A=1, BC=01
                { minterm: 7, row: 1, col: 2 }, // A=1, BC=11
                { minterm: 6, row: 1, col: 3 }  // A=1, BC=10
            ];
            
            for (let i = 0; i < numRows; i++) {
                const mapping = mintermToKmap[i];
                this.kmapData[mapping.row][mapping.col] = minterms.includes(mapping.minterm) ? 1 : 0;
            }
        }
    }

    checkAnswer(expectedKmap) {
        if (!expectedKmap) {
            return { isCorrect: false, message: 'No expected answer provided' };
        }

        let expected;
        if (expectedKmap.values) {
            // 3-input K-map format
            expected = expectedKmap.values;
        } else if (Array.isArray(expectedKmap) && Array.isArray(expectedKmap[0])) {
            // 2-input K-map format (nested array)
            expected = expectedKmap;
        } else {
            return { isCorrect: false, message: 'Invalid expected answer format' };
        }

        const actual = this.kmapData;

        if (!expected || !actual) {
            return { isCorrect: false, message: 'Missing data for comparison' };
        }

        if (expected.length !== actual.length) {
            return { isCorrect: false, message: `Row count mismatch: expected ${expected.length}, got ${actual.length}` };
        }

        for (let i = 0; i < expected.length; i++) {
            if (!Array.isArray(expected[i]) || !Array.isArray(actual[i])) {
                continue;
            }
            if (expected[i].length !== actual[i].length) {
                return { isCorrect: false, message: `Column count mismatch at row ${i}: expected ${expected[i].length}, got ${actual[i].length}` };
            }
            for (let j = 0; j < expected[i].length; j++) {
                const expectedVal = expected[i][j];
                const actualVal = actual[i][j];
                // Handle null/undefined as 0 for comparison, but also handle 'X' as don't-care
                const exp = expectedVal === null || expectedVal === undefined ? 0 : expectedVal;
                const act = actualVal === null || actualVal === undefined ? 0 : actualVal;
                
                // Don't-care (X) matches anything
                if (exp === 'X' || exp === 'x') {
                    continue;
                }
                if (act === 'X' || act === 'x') {
                    continue;
                }
                
                if (exp !== act) {
                    return { isCorrect: false, message: `Mismatch at row ${i}, col ${j}. Expected ${exp}, got ${act}` };
                }
            }
        }

        return { isCorrect: true, message: 'K-map is correct!' };
    }

    getKmapData() {
        return this.kmapData.map(row => [...row]);
    }

    setKmapData(data) {
        this.kmapData = data.map(row => [...row]);
        this.updateDisplay();
    }

    updateDisplay() {
        const cells = this.container.querySelectorAll('.kmap-cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.kmapData[row][col];
            if (value !== null && value !== undefined) {
                this.updateCellAppearance(cell, value);
                cell.textContent = value === 'X' || value === 'x' ? 'X' : value;
            }
        });
    }

    setOnChange(callback) {
        this.onChangeCallback = callback;
    }

    extractExpression(inputs) {
        if (this.numInputs === 2) {
            return this.extractExpression2Input(inputs);
        } else if (this.numInputs === 3) {
            return this.extractExpression3Input(inputs);
        }
        return '';
    }

    extractExpression2Input(inputs) {
        const terms = [];
        const [A, B] = inputs;

        if (this.kmapData[0][0] === 1) terms.push(`NOT ${A} AND NOT ${B}`);
        if (this.kmapData[0][1] === 1) terms.push(`NOT ${A} AND ${B}`);
        if (this.kmapData[1][0] === 1) terms.push(`${A} AND NOT ${B}`);
        if (this.kmapData[1][1] === 1) terms.push(`${A} AND ${B}`);

        if (terms.length === 0) return '0';
        if (terms.length === 1) return terms[0];

        return terms.join(' OR ');
    }

    extractExpression3Input(inputs) {
        const terms = [];
        const [A, B, C] = inputs;

        const colLabels = ['00', '01', '11', '10'];
        
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.kmapData[row][col] === 1) {
                    const aTerm = row === 0 ? `NOT ${A}` : A;
                    const bcLabel = colLabels[col];
                    const bTerm = bcLabel[0] === '0' ? `NOT ${B}` : B;
                    const cTerm = bcLabel[1] === '0' ? `NOT ${C}` : C;
                    terms.push(`(${aTerm} AND ${bTerm} AND ${cTerm})`);
                }
            }
        }

        if (terms.length === 0) return '0';
        if (terms.length === 1) return terms[0];

        return terms.join(' OR ');
    }
}


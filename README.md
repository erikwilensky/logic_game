# Truth Table & K-Map Practice Game

An interactive web-based game for practicing truth tables and Karnaugh maps. Perfect for students learning digital logic and Boolean algebra.

## Features

- **Interactive Truth Tables**: Fill in output columns with real-time validation
- **Karnaugh Map Builder**: Visual K-map editor with click-to-toggle cells
- **Multiple Question Types**: 
  - Truth table construction
  - Boolean expression writing
  - K-map construction and simplification
  - Boss fight challenges
- **Progressive Hints**: Get help when you're stuck
- **Step-by-Step Explanations**: Learn from detailed solutions
- **Scoring System**: Track your progress with points and accuracy
- **Progress Tracking**: Save your progress locally

## Question Categories

### Section A: Truth Tables (Warm-up)
- Basic gate operations (AND, XOR)
- Multi-input expressions
- Real-world scenarios

### Section B: K-map Construction (2-input)
- 2-variable K-maps
- Expression simplification
- Pattern recognition

### Section C: K-map Construction (3-input)
- 3-variable K-maps with Gray code ordering
- Complex grouping
- Expression extraction

### Section D: Harder K-map Grouping
- Wrap-around grouping
- Overlapping groups
- Minterm notation

### Section E: Boss Fight
- Complete challenges with truth tables, K-maps, and simplification
- Gate count analysis

### Additional Practice
- More gate combinations (NAND, NOR)
- Additional 3-input expressions
- Pattern-based challenges

## Deployment to GitHub Pages

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "main" branch (or "master" if that's your default)
   - Click "Save"
   - Your site will be available at `https://yourusername.github.io/your-repo-name/`

3. **Update the repository** (if needed):
   ```bash
   git add .
   git commit -m "Update game"
   git push
   ```

## Local Development

Simply open `index.html` in a web browser. No build process or server required!

For best results, use a modern web browser (Chrome, Firefox, Edge, Safari).

## File Structure

```
logic game/
├── index.html              # Main game page
├── styles/
│   └── main.css           # Game styling
├── scripts/
│   ├── game.js            # Main game logic
│   ├── truthTable.js     # Truth table builder/validator
│   ├── karnaughMap.js    # K-map builder/validator
│   ├── questions.js      # Question bank
│   └── scoring.js        # Scoring and progress tracking
└── README.md              # This file
```

## How to Play

1. **Select a Game Mode**: Choose Practice, Timed, or Exam mode
2. **Choose a Category**: Pick a section to practice
3. **Answer Questions**: 
   - Fill in truth tables by typing 0 or 1
   - Click K-map cells to toggle values (0 → 1 → X → 0)
   - Type Boolean expressions when required
4. **Get Help**: Click "Get Hint" for progressive hints
5. **Check Answers**: Click "Check Answer" to validate your work
6. **Learn**: View step-by-step explanations after checking

## Scoring

- **Easy questions**: 10 points
- **Medium questions**: 20 points
- **Hard questions**: 30 points
- **Streak bonus**: +5 points for every 3 correct answers in a row

Your progress is automatically saved in your browser's local storage.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with JavaScript enabled

## License

This project is open source and available for educational use.


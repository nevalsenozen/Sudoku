import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Pastel ve soft temalar
const THEMES = [
  {
    name: "Pastel Turuncu",
    "--bg": "#fdf6f0",
    "--primary": "#ffb870",
    "--accent": "#ffe0b2",
    "--cell": "#fffdfa",
    "--cell-selected": "#fff3e0",
    "--cell-highlight": "#fff7e6",
    "--cell-error": "#ffb3b3",
    "--cell-fixed": "#ffb870",
    "--text": "#2d2d2d",
    "--button": "#ffb870",
    "--button-text": "#fff",
    "--block-border": "#ffd9b3",
  },
  {
    name: "Pastel Mint",
    "--bg": "#f3fdf9",
    "--primary": "#7de2c5",
    "--accent": "#d0f5e8",
    "--cell": "#fafffd",
    "--cell-selected": "#e0f7f1",
    "--cell-highlight": "#e6f9f3",
    "--cell-error": "#ffd6d6",
    "--cell-fixed": "#7de2c5",
    "--text": "#2d2d2d",
    "--button": "#7de2c5",
    "--button-text": "#fff",
    "--block-border": "#b2f2e0",
  },
  {
    name: "Pastel Mercan",
    "--bg": "#fdf3f2",
    "--primary": "#ffb3a7",
    "--accent": "#ffe0db",
    "--cell": "#fffafa",
    "--cell-selected": "#ffe6e1",
    "--cell-highlight": "#fff0ed",
    "--cell-error": "#ffb3b3",
    "--cell-fixed": "#ffb3a7",
    "--text": "#2d2d2d",
    "--button": "#ffb3a7",
    "--button-text": "#fff",
    "--block-border": "#ffd6d1",
  },
  {
    name: "Pastel Yeşil",
    "--bg": "#f3fdf4",
    "--primary": "#b6e6b3",
    "--accent": "#e0fbe0",
    "--cell": "#fafffa",
    "--cell-selected": "#e6fbe6",
    "--cell-highlight": "#f0fdf0",
    "--cell-error": "#ffd6d6",
    "--cell-fixed": "#b6e6b3",
    "--text": "#2d2d2d",
    "--button": "#b6e6b3",
    "--button-text": "#fff",
    "--block-border": "#d1f7d1",
  },
  {
    name: "Pastel Mavi",
    "--bg": "#f3f7fd",
    "--primary": "#a7c7ff",
    "--accent": "#dbe8ff",
    "--cell": "#fafcff",
    "--cell-selected": "#e1edff",
    "--cell-highlight": "#edf4ff",
    "--cell-error": "#ffd6d6",
    "--cell-fixed": "#a7c7ff",
    "--text": "#2d2d2d",
    "--button": "#a7c7ff",
    "--button-text": "#fff",
    "--block-border": "#c7dbff",
  },
];

// Sudoku üretici ve çözücü
function generateSudoku(difficulty = "easy") {
  const clues = { easy: 40, medium: 32, hard: 24 };
  const size = 9;
  const board = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0));

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num || board[x][col] === num) return false;
    }
    const startRow = row - (row % 3),
      startCol = col - (col % 3);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[i + startRow][j + startCol] === num) return false;
    return true;
  }

  function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          let nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (let num of nums) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function copyBoard(b) {
    return b.map((row) => [...row]);
  }

  function removeCells(board, cluesCount) {
    let removed = 81 - cluesCount;
    let puzzle = copyBoard(board);
    while (removed > 0) {
      let row = Math.floor(Math.random() * 9);
      let col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed--;
      }
    }
    return puzzle;
  }

  fillBoard(board);
  const solution = copyBoard(board);
  const puzzle = removeCells(board, clues[difficulty]);
  return { puzzle, solution };
}

function deepEqual(a, b) {
  return a.every((row, i) => row.every((cell, j) => cell === b[i][j]));
}

function getEmptyCells(board) {
  const empty = [];
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++) if (board[i][j] === 0) empty.push([i, j]);
  return empty;
}

function countErrors(board, solution, fixed) {
  let errors = 0;
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++)
      if (
        board[i][j] !== 0 &&
        board[i][j] !== solution[i][j] &&
        !fixed[i][j]
      )
        errors++;
  return errors;
}

function App() {
  const [screen, setScreen] = useState("menu");
  const [difficulty, setDifficulty] = useState("easy");
  const [theme, setTheme] = useState(THEMES[0]);
  const [sudoku, setSudoku] = useState(null);
  const [userBoard, setUserBoard] = useState(null);
  const [fixed, setFixed] = useState(null);
  const [selected, setSelected] = useState(null); // [row, col]
  const [score, setScore] = useState(1000);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [errors, setErrors] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [showHintAnim, setShowHintAnim] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hintMsg, setHintMsg] = useState("");
  const boardRef = useRef(null);

  // Tema değişimi
  function applyTheme(themeObj) {
    Object.entries(themeObj).forEach(([key, value]) => {
      if (key.startsWith("--")) {
        document.documentElement.style.setProperty(key, value);
      }
    });
    setTheme(themeObj);
  }

  // Ana menüde random tema
  useEffect(() => {
    if (screen === "menu") {
      const t = THEMES[Math.floor(Math.random() * THEMES.length)];
      applyTheme(t);
    }
    // eslint-disable-next-line
  }, [screen]);

  // Oyun başlat
  function startGame(diff = difficulty) {
    const t = THEMES.filter((th) => th !== theme);
    const newTheme = t[Math.floor(Math.random() * t.length)];
    applyTheme(newTheme);
    const { puzzle, solution } = generateSudoku(diff);
    setSudoku({ puzzle, solution });
    setUserBoard(puzzle.map((row) => [...row]));
    setFixed(
      puzzle.map((row) => row.map((cell) => cell !== 0))
    );
    setSelected(null);
    setScore(1000);
    setTimer(0);
    setErrors(0);
    setHintCount(0);
    setShowHintAnim(false);
    setShowConfirm(false);
    setGameOver(false);
    setHintMsg("");
    setScreen("game");
  }

  // Zamanlayıcı
  useEffect(() => {
    if (screen === "game" && !gameOver) {
      const id = setInterval(() => {
        setTimer((t) => t + 1);
        setScore((s) => Math.max(0, s - 10));
      }, 30000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
    }
    // eslint-disable-next-line
  }, [screen, gameOver]);

  // Hata sayacı
  useEffect(() => {
    if (userBoard && sudoku && fixed) {
      setErrors(countErrors(userBoard, sudoku.solution, fixed));
    }
    // eslint-disable-next-line
  }, [userBoard, sudoku, fixed]);

  // Oyun bitti mi?
  useEffect(() => {
    if (
      userBoard &&
      sudoku &&
      deepEqual(userBoard, sudoku.solution) &&
      !gameOver
    ) {
      setGameOver(true);
      setScreen("finish");
      if (intervalId) clearInterval(intervalId);
    }
    // eslint-disable-next-line
  }, [userBoard, sudoku, gameOver]);

  // Klavye desteği
  useEffect(() => {
    if (screen !== "game" || !userBoard || !selected || gameOver) return;
    function handleKey(e) {
      if (!selected) return;
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(Number(e.key));
      } else if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "Del"
      ) {
        handleDelete();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [selected, userBoard, gameOver, screen]);

  // Hücre seçimi
  function handleCellClick(row, col) {
    if (fixed[row][col]) return;
    setSelected([row, col]);
  }

  // Sayı butonları ve klavye
  function handleNumberInput(num) {
    if (!selected || gameOver) return;
    const [row, col] = selected;
    if (fixed[row][col]) return;
    const newBoard = userBoard.map((r) => [...r]);
    if (userBoard[row][col] !== num) {
      newBoard[row][col] = num;
      setUserBoard(newBoard);
      if (sudoku.solution[row][col] !== num) {
        setScore((s) => Math.max(0, s - 30));
      }
    }
  }

  // Sil butonu ve klavye
  function handleDelete() {
    if (!selected || gameOver) return;
    const [row, col] = selected;
    if (fixed[row][col]) return;
    if (userBoard[row][col] !== 0) {
      const newBoard = userBoard.map((r) => [...r]);
      newBoard[row][col] = 0;
      setUserBoard(newBoard);
    }
  }

  // İpucu
  function handleHint() {
    setHintMsg("");
    if (!userBoard || !sudoku || gameOver) return;
    if (score < 50) {
      setHintMsg("Yeterli puanın yok");
      return;
    }
    const empty = getEmptyCells(userBoard);
    if (empty.length === 0) return;
    const idx = Math.floor(Math.random() * empty.length);
    const [row, col] = empty[idx];
    const newBoard = userBoard.map((r) => [...r]);
    newBoard[row][col] = sudoku.solution[row][col];
    setUserBoard(newBoard);
    setScore((s) => Math.max(0, s - 50));
    setHintCount((c) => c + 1);
    setShowHintAnim([row, col]);
    setTimeout(() => setShowHintAnim(false), 800);
  }

  // Çözümü Göster
  function handleShowSolution() {
    setShowConfirm(true);
  }
  function confirmShowSolution() {
    setUserBoard(sudoku.solution.map((row) => [...row]));
    setScore(0);
    setGameOver(true);
    setScreen("finish");
    setShowConfirm(false);
    if (intervalId) clearInterval(intervalId);
  }

  // Yeni Oyun
  function handleNewGame() {
    startGame(difficulty);
  }

  // Ana Menü
  function handleMenu() {
    setScreen("menu");
    setSudoku(null);
    setUserBoard(null);
    setFixed(null);
    setSelected(null);
    setScore(1000);
    setTimer(0);
    setErrors(0);
    setHintCount(0);
    setShowHintAnim(false);
    setShowConfirm(false);
    setGameOver(false);
    setHintMsg("");
  }

  // Süre formatı
  function formatTime(sec) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Ana Menü
  if (screen === "menu") {
    return (
      <div className="menu fade-in">
        <div className="logo-card">
          <span className="logo-sudoku-only">SUDOKU</span>
        </div>
        <div className="desc">
          <p>
            Zihnini zorla, puan topla! <br />
            Modern, sade ve mobil uyumlu Sudoku deneyimi.
          </p>
        </div>
        <div className="difficulty">
          <span>Zorluk:</span>
          <div className="diff-buttons">
            <button
              className={difficulty === "easy" ? "active" : ""}
              onClick={() => setDifficulty("easy")}
            >
              Kolay
            </button>
            <button
              className={difficulty === "medium" ? "active" : ""}
              onClick={() => setDifficulty("medium")}
            >
              Orta
            </button>
            <button
              className={difficulty === "hard" ? "active" : ""}
              onClick={() => setDifficulty("hard")}
            >
              Zor
            </button>
          </div>
        </div>
        <button className="start-btn" onClick={() => startGame()}>
          Oyuna Başla
        </button>
      </div>
    );
  }

  // Oyun Ekranı
  if (screen === "game" && sudoku && userBoard && fixed) {
    return (
      <div className="game fade-in">
        <div className="game-header">
          <button className="menu-btn" onClick={handleMenu}>
            Ana Menü
          </button>
          <div className="score">
            <span>Puan: {score}</span>
            <span>Hata: {errors}</span>
            <span>Süre: {formatTime(timer)}</span>
          </div>
          <button className="newgame-btn" onClick={handleNewGame}>
            Yeni Oyun
          </button>
        </div>
        <SudokuBoard
          board={userBoard}
          fixed={fixed}
          selected={selected}
          onCellClick={handleCellClick}
          solution={sudoku.solution}
          showHintAnim={showHintAnim}
        />
        <div className="number-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleNumberInput(n)}
              className="num-btn"
              tabIndex={-1}
            >
              {n}
            </button>
          ))}
          <button className="del-btn" onClick={handleDelete} tabIndex={-1}>
            Sil
          </button>
        </div>
        <div className="game-actions">
          <button
            className="hint-btn"
            onClick={handleHint}
            disabled={score < 50}
            title={score < 50 ? "Yeterli puanın yok" : ""}
          >
            İpucu Al (-50)
          </button>
          <button className="giveup-btn" onClick={handleShowSolution}>
            Pes Et / Çözümü Göster
          </button>
        </div>
        {hintMsg && <div className="hint-msg">{hintMsg}</div>}
        {showConfirm && (
          <div className="modal">
            <div className="modal-content">
              <p>
                Çözümü görmek istediğine emin misin? <br />
                Puanın 0 olacak.
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn"
                  onClick={confirmShowSolution}
                >
                  Evet, Göster
                </button>
                <button
                  className="modal-btn"
                  onClick={() => setShowConfirm(false)}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Oyun Bitti Ekranı
  if (screen === "finish" && sudoku && userBoard) {
    return (
      <div className="finish fade-in">
        <h2>Tebrikler!</h2>
        <p>
          Sudoku'yu tamamladın.<br />
          Final Puanın: <span className="final-score">{score}</span>
        </p>
        <div className="finish-actions">
          <button className="newgame-btn" onClick={handleNewGame}>
            Yeni Oyun
          </button>
          <button className="menu-btn" onClick={handleMenu}>
            Ana Menü
          </button>
        </div>
        <div className="finish-board">
          <SudokuBoard
            board={userBoard}
            fixed={fixed}
            selected={null}
            solution={sudoku.solution}
            showHintAnim={false}
          />
        </div>
      </div>
    );
  }

  // Yükleniyor
  return (
    <div className="loading">
      <div className="loader"></div>
      <span>Yükleniyor...</span>
    </div>
  );
}

// Sudoku Tahtası Bileşeni
function SudokuBoard({
  board,
  fixed,
  selected,
  onCellClick,
  solution,
  showHintAnim,
}) {
  const selectedValue =
    selected && board[selected[0]][selected[1]] !== 0
      ? board[selected[0]][selected[1]]
      : null;

  return (
    <div className="sudoku-board">
      {board.map((row, i) =>
        row.map((cell, j) => {
          const isSelected =
            selected && selected[0] === i && selected[1] === j;
          const isFixed = fixed[i][j];
          const isError =
            cell !== 0 && cell !== solution[i][j] && !isFixed;
          const isSameValue =
            selectedValue && cell === selectedValue && cell !== 0;
          const isHint =
            showHintAnim &&
            Array.isArray(showHintAnim) &&
            showHintAnim[0] === i &&
            showHintAnim[1] === j;
          // 3x3 blok çizgileri için class
          const blockClass =
            (j === 2 || j === 5 ? " block-right" : "") +
            (i === 2 || i === 5 ? " block-bottom" : "");
          return (
            <div
              key={i + "-" + j}
              className={
                "cell" +
                (isFixed ? " fixed" : "") +
                (isSelected ? " selected" : "") +
                (isSameValue ? " highlight" : "") +
                (isError ? " error" : "") +
                (isHint ? " hint-anim" : "") +
                blockClass
              }
              onClick={() => onCellClick && onCellClick(i, j)}
              tabIndex={0}
              aria-label={`Satır ${i + 1}, Sütun ${j + 1}`}
            >
              {cell !== 0 ? cell : ""}
            </div>
          );
        })
      )}
    </div>
  );
}

export default App;
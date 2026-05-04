import { useEffect, useMemo, useState } from "react";
import "./App.css";

const SIZE = 9;

const THEMES = [
  {
    bg: "#fdf6f0",
    primary: "#ff9f43",
    accent: "#ffe0b2",
    cell: "#fffdfa",
    selected: "#fff3e0",
    highlight: "#fff8ec",
    error: "#ffb3b3",
    fixed: "#e67817",
    text: "#2d2d2d",
    border: "#ffd1a3",
  },
  {
    bg: "#eefaf6",
    primary: "#2bb3a3",
    accent: "#c8f3ec",
    cell: "#fbfffe",
    selected: "#dff8f3",
    highlight: "#effcf9",
    error: "#ffb8b8",
    fixed: "#168b7f",
    text: "#20302e",
    border: "#ace5dc",
  },
  {
    bg: "#fff4f2",
    primary: "#ef6f61",
    accent: "#ffd2cc",
    cell: "#fffdfc",
    selected: "#ffe6e2",
    highlight: "#fff1ee",
    error: "#ffb3b3",
    fixed: "#d95143",
    text: "#342321",
    border: "#ffc1b8",
  },
  {
    bg: "#f0f7ff",
    primary: "#3b82f6",
    accent: "#cfe3ff",
    cell: "#fbfdff",
    selected: "#e3f0ff",
    highlight: "#f1f7ff",
    error: "#ffb3b3",
    fixed: "#2563eb",
    text: "#1f2937",
    border: "#b7d4ff",
  },
];

function getRandomTheme() {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function isSafe(board, row, col, num) {
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

function fillBoard(board) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

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

function generateSolvedBoard() {
  const board = createEmptyBoard();
  fillBoard(board);
  return board;
}

function removeNumbers(solvedBoard, difficulty) {
  const puzzle = solvedBoard.map((row) => [...row]);

  const removeCount =
    difficulty === "easy" ? 36 : difficulty === "medium" ? 45 : 54;

  let removed = 0;

  while (removed < removeCount) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return puzzle;
}

function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [difficulty, setDifficulty] = useState("easy");
  const [theme, setTheme] = useState(getRandomTheme());

  const [solution, setSolution] = useState([]);
  const [puzzle, setPuzzle] = useState([]);
  const [userBoard, setUserBoard] = useState([]);
  const [fixedCells, setFixedCells] = useState([]);

  const [selectedCell, setSelectedCell] = useState(null);
  const [activeNumber, setActiveNumber] = useState(null);
  const [score, setScore] = useState(1000);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hintMessage, setHintMessage] = useState("");
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [revealedByHint, setRevealedByHint] = useState({});
  const [showedSolution, setShowedSolution] = useState(false);

  const themeStyle = useMemo(
    () => ({
      "--bg": theme.bg,
      "--primary": theme.primary,
      "--accent": theme.accent,
      "--cell": theme.cell,
      "--cell-selected": theme.selected,
      "--cell-highlight": theme.highlight,
      "--cell-error": theme.error,
      "--cell-fixed": theme.fixed,
      "--text": theme.text,
      "--button": theme.primary,
      "--button-text": "#ffffff",
      "--block-border": theme.border,
    }),
    [theme]
  );

  function startGame(selectedDifficulty = difficulty) {
    const solved = generateSolvedBoard();
    const newPuzzle = removeNumbers(solved, selectedDifficulty);

    setTheme(getRandomTheme());
    setDifficulty(selectedDifficulty);
    setSolution(solved);
    setPuzzle(newPuzzle);
    setUserBoard(cloneBoard(newPuzzle));
    setFixedCells(newPuzzle.map((row) => row.map((cell) => cell !== 0)));
    setSelectedCell(null);
    setActiveNumber(null);
    setScore(1000);
    setErrors(0);
    setTime(0);
    setMessage("");
    setErrorMessage("");
    setHintMessage("");
    setShowGiveUpModal(false);
    setGameOver(false);
    setRevealedByHint({});
    setShowedSolution(false);
    setScreen("game");
  }

  function goMenu() {
    setTheme(getRandomTheme());
    setScreen("menu");
    setSelectedCell(null);
    setActiveNumber(null);
    setShowGiveUpModal(false);
  }

  function changeScore(amount) {
    setScore((prev) => Math.max(0, prev + amount));
  }

  function isHighlightAllowed() {
    return difficulty === "easy" || difficulty === "medium";
  }

  function handleCellClick(row, col) {
    const value = userBoard[row][col];

    setSelectedCell({ row, col });

    if (isHighlightAllowed() && value !== 0) {
      setActiveNumber(value);
    } else if (!isHighlightAllowed()) {
      setActiveNumber(null);
    }
  }

  function applyNumber(number) {
    if (!selectedCell || gameOver) return;

    const { row, col } = selectedCell;

    if (fixedCells[row][col]) {
      if (isHighlightAllowed() && userBoard[row][col] !== 0) {
        setActiveNumber(userBoard[row][col]);
      }
      return;
    }

    const oldValue = userBoard[row][col];
    const copy = cloneBoard(userBoard);
    copy[row][col] = number;
    setUserBoard(copy);

    if (isHighlightAllowed()) {
      setActiveNumber(number);
    } else {
      setActiveNumber(null);
    }

    setHintMessage("");

    if (number !== solution[row][col] && oldValue !== number) {
      setErrors((prev) => prev + 1);
      changeScore(-30);
      setErrorMessage("Hatalı giriş!");
      setTimeout(() => setErrorMessage(""), 1200);
    }

    checkFinished(copy);
  }

  function clearSelectedCell() {
    if (!selectedCell || gameOver) return;

    const { row, col } = selectedCell;

    if (fixedCells[row][col]) return;

    const copy = cloneBoard(userBoard);
    copy[row][col] = 0;
    setUserBoard(copy);
    setActiveNumber(null);
  }

  function getEmptyCells() {
    const empty = [];

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (userBoard[row][col] === 0 && !fixedCells[row][col]) {
          empty.push({ row, col });
        }
      }
    }

    return empty;
  }

  function getHint() {
    if (gameOver) return;

    if (score < 50) {
      setHintMessage("Yeterli puanın yok kankim 😅");
      return;
    }

    const emptyCells = getEmptyCells();

    if (emptyCells.length === 0) {
      setHintMessage("Boş kutu kalmadı.");
      return;
    }

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;

    const copy = cloneBoard(userBoard);
    copy[row][col] = solution[row][col];

    setUserBoard(copy);
    setSelectedCell({ row, col });
    setRevealedByHint((prev) => ({ ...prev, [`${row}-${col}`]: true }));

    if (isHighlightAllowed()) {
      setActiveNumber(solution[row][col]);
    }

    changeScore(-50);
    setHintMessage("İpucu kullanıldı: -50 puan");
    checkFinished(copy);
  }

  function giveUp() {
    setUserBoard(cloneBoard(solution));
    setScore(0);
    setGameOver(true);
    setShowedSolution(true);
    setShowGiveUpModal(false);
    setScreen("finish");
    setMessage("Pes ettin, çözüm gösterildi.");
  }

  function checkFinished(boardToCheck = userBoard) {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (boardToCheck[row][col] === 0) return false;
        if (boardToCheck[row][col] !== solution[row][col]) return false;
      }
    }

    setGameOver(true);
    setScreen("finish");
    setMessage("Helal! Sudoku tamamlandı 🎉");
    return true;
  }

  function isCellWrong(row, col) {
    return (
      userBoard[row][col] !== 0 &&
      !fixedCells[row][col] &&
      userBoard[row][col] !== solution[row][col]
    );
  }

  function isRelatedCell(row, col) {
    if (!selectedCell) return false;

    const sameRow = selectedCell.row === row;
    const sameCol = selectedCell.col === col;
    const sameBox =
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3);

    return sameRow || sameCol || sameBox;
  }

  function getCellClass(row, col) {
    let className = "cell";

    if (fixedCells[row]?.[col]) className += " fixed";
    if (selectedCell?.row === row && selectedCell?.col === col) {
      className += " selected";
    }
    if (isRelatedCell(row, col)) className += " highlight";
    if (isCellWrong(row, col)) className += " error";

    if (
      isHighlightAllowed() &&
      activeNumber &&
      userBoard[row]?.[col] === activeNumber
    ) {
      className += " same-number";
    }

    if ((col + 1) % 3 === 0 && col !== 8) className += " block-right";
    if ((row + 1) % 3 === 0 && row !== 8) className += " block-bottom";

    if (revealedByHint[`${row}-${col}`]) className += " hint-anim";

    if (showedSolution && puzzle[row]?.[col] === 0) {
      className += " solution-fill";
    }

    return className;
  }

  useEffect(() => {
    if (screen !== "game" || gameOver) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        const next = prev + 1;

        if (next % 30 === 0) {
          setScore((scorePrev) => Math.max(0, scorePrev - 10));
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, gameOver]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (screen !== "game" || gameOver) return;

      if (e.key >= "1" && e.key <= "9") {
        applyNumber(Number(e.key));
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        clearSelectedCell();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (screen === "menu") {
    return (
      <div className="page" style={themeStyle}>
        <main className="menu fade-in">
          <div className="logo-card">
          
            <h1 className="sudoku-title">Sudoku</h1>
          </div>

          <p className="desc">
            Zekanı zorlamaya hazır mısın? Seviyeni seç ve Sudoku meydan okumasına başla. 
          </p>

          <div className="difficulty">
            <strong> </strong>

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

          <button className="start-btn" onClick={() => startGame(difficulty)}>
            Oyuna Başla
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="page" style={themeStyle}>
      <main className={screen === "finish" ? "finish fade-in" : "game fade-in"}>
        <div className="game-header">
          <button className="menu-btn" onClick={goMenu}>
            Ana Menü
          </button>

          <div className="score">
            <span>Puan: {score}</span>
            <span>Süre: {formatTime(time)}</span>
            <span>Hata: {errors}</span>
          </div>

          <button className="newgame-btn" onClick={() => startGame(difficulty)}>
            Yeni Oyun
          </button>
        </div>

        {screen === "finish" && (
          <>
            <h2>{message}</h2>
            <div className="final-score">Final Puanı: {score}</div>

            <div className="finish-actions">
              <button className="newgame-btn" onClick={() => startGame(difficulty)}>
                Tekrar Oyna
              </button>

              <button className="menu-btn" onClick={goMenu}>
                Menü
              </button>
            </div>
          </>
        )}

        <div
          className={`sudoku-board ${
            screen === "finish" ? "finish-board solution-board" : ""
          }`}
        >
          {userBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                type="button"
              >
                {cell === 0 ? "" : cell}
              </button>
            ))
          )}
        </div>

        {screen === "game" && (
          <>
            <div className="number-pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  className="num-btn"
                  onClick={() => applyNumber(num)}
                  type="button"
                >
                  {num}
                </button>
              ))}

              <button className="del-btn" onClick={clearSelectedCell} type="button">
                Sil
              </button>
            </div>

            <div className="game-actions">
              <button
                className="hint-btn"
                onClick={getHint}
                disabled={score < 50}
                type="button"
              >
                İpucu Al -50
              </button>

              <button
                className="giveup-btn"
                onClick={() => setShowGiveUpModal(true)}
                type="button"
              >
                Pes Et
              </button>
            </div>

            {hintMessage && <p className="hint-msg">{hintMessage}</p>}
            {errorMessage && <p className="error-msg">{errorMessage}</p>}
          </>
        )}

        {showGiveUpModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Emin misin?</h3>
              <p>Çözümü gösterirsen puanın 0 olacak.</p>

              <div className="modal-actions">
                <button className="modal-btn" onClick={giveUp}>
                  Evet, göster
                </button>

                <button
                  className="modal-btn"
                  onClick={() => setShowGiveUpModal(false)}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
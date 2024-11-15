import { GAME_BOARD_DIM, FIRST_PLAYER, SECOND_PLAYER } from "../consts.mjs";
import { print, clearScreen } from "../utils/io.mjs";
import KeyBoardManager from "../utils/io.mjs";

function createBattleshipScreen(firstPlayerBoard, secondPlayerBoard) {
    let currentPlayer = FIRST_PLAYER;
    let cursorRow = 0;
    let cursorColumn = 0;
    let firstPlayerShots = create2DArrayWithFill(GAME_BOARD_DIM, 0);
    let secondPlayerShots = create2DArrayWithFill(GAME_BOARD_DIM, 0);

    function create2DArrayWithFill(size, fillValue) {
        return Array.from({ length: size }, () => Array(size).fill(fillValue));
    }

    function swapPlayer() {
        currentPlayer *= -1;
        cursorRow = 0;
        cursorColumn = 0;
    }

    function getBoards() {
        if (currentPlayer === FIRST_PLAYER) {
            return {
                playerBoard: firstPlayerBoard,
                opponentBoard: secondPlayerBoard,
                shotsBoard: firstPlayerShots,
            };
        } else {
            return {
                playerBoard: secondPlayerBoard,
                opponentBoard: firstPlayerBoard,
                shotsBoard: secondPlayerShots,
            };
        }
    }

    function checkVictory(opponentBoard) {
        // Check if all ship cells (non-zero) have been hit
        return opponentBoard.every(row => row.every(cell => cell === 0 || typeof cell === "string"));
    }

    function markHitOrMiss(row, column, opponentBoard, shotsBoard) {
        // Check for out-of-bounds access
        if (
            row < 0 ||
            row >= GAME_BOARD_DIM ||
            column < 0 ||
            column >= GAME_BOARD_DIM
        ) {
            console.error(`Invalid access in markHitOrMiss: row=${row}, column=${column}`);
            return false;
        }
    
        if (opponentBoard[row][column] !== 0) {
            shotsBoard[row][column] = "X"; // Mark hit
            opponentBoard[row][column] = 0; // Remove ship part
            return true;
        } else {
            shotsBoard[row][column] = "O"; // Mark miss
            return false;
        }
    }
    
    

    return {
        isDrawn: false,
        next: null,
        transitionTo: null,

        init: function (firstPBoard, secondPBoard) {
            if (!Array.isArray(firstPBoard) || !Array.isArray(secondPBoard)) {
                throw new Error("Both player boards must be valid 2D arrays");
            }
        
            firstPlayerBoard = firstPBoard;
            secondPlayerBoard = secondPBoard;
        
            // Initialize shot boards as clean copies
            firstPlayerShots = create2DArrayWithFill(GAME_BOARD_DIM, 0);
            secondPlayerShots = create2DArrayWithFill(GAME_BOARD_DIM, 0);
        },
        

        update: function (dt) {
            const { shotsBoard, opponentBoard } = getBoards();
        
            if (KeyBoardManager.isUpPressed()) {
                cursorRow = Math.max(0, cursorRow - 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isDownPressed()) {
                cursorRow = Math.min(GAME_BOARD_DIM - 1, cursorRow + 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isLeftPressed()) {
                cursorColumn = Math.max(0, cursorColumn - 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isRightPressed()) {
                cursorColumn = Math.min(GAME_BOARD_DIM - 1, cursorColumn + 1);
                this.isDrawn = false;
            }
        
            if (KeyBoardManager.isEnterPressed()) {
                this.isDrawn = false;
        
                // Validate cursor position
                if (
                    cursorRow < 0 ||
                    cursorRow >= GAME_BOARD_DIM ||
                    cursorColumn < 0 ||
                    cursorColumn >= GAME_BOARD_DIM
                ) {
                    console.error(`Invalid cursor position: row=${cursorRow}, column=${cursorColumn}`);
                    return; // Prevent firing if out of bounds
                }
        
                // If the cell is already shot, ignore
                if (shotsBoard[cursorRow][cursorColumn] === 0) {
                    const isHit = markHitOrMiss(cursorRow, cursorColumn, opponentBoard, shotsBoard);
        
                    if (checkVictory(opponentBoard)) {
                        this.next = () => `Player ${currentPlayer === FIRST_PLAYER ? 1 : 2} wins!`;
                        this.transitionTo = "game over";
                    } else if (!isHit) {
                        swapPlayer(); // Switch turns if it’s a miss
                    }
                }
            }
        },

        draw: function (dr) {
            if (this.isDrawn) return; // Skip if already drawn
            this.isDrawn = true;

            clearScreen();

            const { shotsBoard } = getBoards();

            let output = `Player ${currentPlayer === FIRST_PLAYER ? 1 : 2}'s Turn\n\n`;

            // Header
            output += "   ";
            for (let col = 0; col < GAME_BOARD_DIM; col++) {
                output += ` ${String.fromCharCode(65 + col)}`;
            }
            output += "\n";

            // Board with shots
            for (let row = 0; row < GAME_BOARD_DIM; row++) {
                output += `${String(row + 1).padStart(2, ' ')} `;

                for (let col = 0; col < GAME_BOARD_DIM; col++) {
                    if (row === cursorRow && col === cursorColumn) {
                        output += `[${shotsBoard[row][col] || " "}]`; // Highlight cursor
                    } else if (shotsBoard[row][col] === "X") {
                        output += ` ${ANSI.COLOR.RED}X${ANSI.RESET} `;
                    } else if (shotsBoard[row][col] === "O") {
                        output += ` ${ANSI.COLOR.CYAN}O${ANSI.RESET} `;
                    } else {
                        output += " . ";
                    }
                }
                output += ` ${row + 1}\n`;
            }

            // Footer
            output += "   ";
            for (let col = 0; col < GAME_BOARD_DIM; col++) {
                output += ` ${String.fromCharCode(65 + col)}`;
            }
            output += "\n\n";

            output += "Controls:\n";
            output += "Arrow keys: Move cursor\n";
            output += "Enter: Fire\n";

            print(output);
        },
    };
}

export default createBattleshipScreen;

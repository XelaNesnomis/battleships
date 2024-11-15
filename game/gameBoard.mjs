import { create2DArrayWithFill } from "../utils/array.mjs";

function createGameBoard(dim) {
    if (typeof dim !== "number" || dim <= 0) {
        console.error("Invalid dimension for game board creation");
        return null;
    }

    return {
        ships: create2DArrayWithFill(dim, 0), // Initialize empty with zeros
        target: create2DArrayWithFill(dim, 0) // Initialize empty with zeros
    };
}

export default createGameBoard;
// Define a variable to keep track of the selected cell
let selectedCell = null;
let crosswordData = null; // To store crossword data
let cluecount = 0; 



// Function to handle cell click event
function handleCellClick(event) {
    const cell = event.target;

    if (!cell.classList.contains("has-clue")) {
        displayFeedback("Invalid Selection", "Please select a cell with a clue.");
        return;
    }

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const cellData = getCrosswordDataForCell(row, col);

    if (cellData) {
        if (cellData.isCorrect) {
            displayFeedback("Already Correct", "You've already solved this word.");
        } else if (isStartingCell(row, col, cellData)) {
            selectedCell = cell;
            const answer = prompt("Enter your answer:");

            if (answer !== null) {
                if (answer.toUpperCase() === cellData.answer.toUpperCase()) {
                    const cellsToMark = calculateCellsToMark(row, col, cellData);
                    markCorrectCells(cellsToMark, answer);
                    cellData.isCorrect = true;
                    displayFeedback("Correct Answer", "Well done!");
                } else {
                    cell.classList.add("incorrect");
                    displayFeedback("Incorrect Answer", "Try again.");
                }
            }
        } else {
            displayFeedback("Invalid Selection", "Please select the first letter of the word.");
        }
    }
}

// Function to display feedback in a modal
function displayFeedback(title, message) {
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackMessage = document.getElementById("feedback-message");

    feedbackTitle.textContent = title;
    feedbackMessage.textContent = message;

    feedbackModal.style.display = "block";

    // Add a click event listener to the modal overlay to close it when clicked away
    feedbackModal.addEventListener("click", (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = "none";
        }
    });
}

function isStartingCell(row, col, cellData) {
    if (cellData.direction === "horizontal") {
        return col === cellData.col;
    } else if (cellData.direction === "vertical") {
        return row === cellData.row;
    }
    return false;
}

function closeWinModal() {
    const winModal = document.getElementById("win-modal");
    winModal.style.display = "none";
}

// Function to calculate cells to mark as correct based on word direction and length
function calculateCellsToMark(row, col, cellData) {
    const cellsToMark = [];
    const length = cellData.answer.length;

    
    if (cellData.direction === "horizontal") {
        for (let i = col; i < col + length; i++) {
            cellsToMark.push({ row, col: i });
        }
    } else if (cellData.direction === "vertical") {
        for (let i = row; i < row + length; i++) {
            cellsToMark.push({ row: i, col });
        }
    }

    return cellsToMark;
}

function markCorrectCells(cellsToMark, answer) {
    let count = 0;
    cellsToMark.forEach((cellPos) => {
        
        const cellId = `cell-${cellPos.row}-${cellPos.col}`;
        console.log(cellId);
        
        const cell = document.getElementById(cellId);

       
        if (cell) {

            if (cell.classList.contains("incorrect")){
                cell.classList.remove("incorrect");
            }

            
            
            cell.classList.add("correct");
            cell.textContent = answer[count]; // Fill the cell with the answer
            count = count + 1;
            
        }
        
        
    });

    cluecount = cluecount + 1;
        if (cluecount == 11) {
            const winModal = document.getElementById("win-modal");
            winModal.style.display = "block"; // Display the win modal
        }
}


// Function to get crossword data for a specific cell
function getCrosswordDataForCell(row, col) {
    for (const clue of crosswordData.clues) {
        if (
            (clue.direction === "horizontal" &&
                row === clue.row &&
                col >= clue.col &&
                col < clue.col + clue.answer.length) ||
            (clue.direction === "vertical" &&
                col === clue.col &&
                row >= clue.row &&
                row < clue.row + clue.answer.length)
        ) {
            return clue;
        }
    }
    return null;
}

// Function to generate the crossword grid
function generateCrosswordGrid() {
    const numRows = 17;
    const numCols = 16;

    const gridSize = 17; // Assuming a 17x17 grid size
    const gridTable = document.getElementById("crossword-grid");

    for (let row = 0; row < numRows; row++) {
        const newRow = document.createElement("tr");
        for (let col = 0; col < numCols; col++) {
            const newCell = document.createElement("td");
            const cellId = `cell-${row}-${col}`;

            const hasClue = crosswordData.clues.some((clue) => {
                return (
                    (clue.direction === "horizontal" &&
                        row === clue.row &&
                        col >= clue.col &&
                        col < clue.col + clue.answer.length) ||
                    (clue.direction === "vertical" &&
                        col === clue.col &&
                        row >= clue.row &&
                        row < clue.row + clue.answer.length)
                );
            });

            if (hasClue) {
                newCell.classList.add("has-clue");
                newCell.dataset.row = row;
                newCell.dataset.col = col;
                newCell.addEventListener("click", handleCellClick);
            }

            newCell.id = cellId;
            newRow.appendChild(newCell);
        }
        gridTable.appendChild(newRow);
    }
}

// Function to fetch crossword data from the backend
async function fetchCrosswordData() {
    try {
        const response = await fetch("/crossword_data.json"); // Replace with your API endpoint
        if (!response.ok) {
            throw new Error("Failed to fetch crossword data.");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Function to initialize crossword
async function initializeCrossword() {
    crosswordData = await fetchCrosswordData();
    if (crosswordData) {
        generateCrosswordGrid();
        generateClueLabels(crosswordData);
        generateCrosswordClues(crosswordData);


    } else {
        console.error("Unable to fetch crossword data.");
    }
}

// Call the initialization function when the page loads
// ... Your previous code ...

// Function to generate clue labels based on crosswordData
function generateClueLabels(crosswordData) {
    const clueLabelsContainer = document.querySelector(".clue-labels");

    crosswordData.clues.forEach(clue => {
        const label = document.createElement("div");
        label.classList.add("clue-label");
        label.textContent = `${clue.position}`; // Include the position number

        // Position the label over the corresponding grid cell
        const cellId = `cell-${clue.row}-${clue.col}`;
        const gridCell = document.getElementById(cellId);

        if (gridCell) {
            // Get the position of the grid cell
            const cellRect = gridCell.getBoundingClientRect();

            // Adjust label position to overlay the cell
            label.style.position = "absolute";
            label.style.top = `${cellRect.top}px`;
            label.style.left = `${cellRect.left}px`;
            // Apply a smaller font size to the label
            label.style.fontSize = "9px"; // Adjust this value as needed

            clueLabelsContainer.appendChild(label);
        }
    });
}

// Function to generate crossword clues based on crosswordData
function generateCrosswordClues(crosswordData) {
    const acrossClues = [];
    const downClues = [];

    crosswordData.clues.forEach(clue => {
        if (clue.direction === "horizontal") {
            acrossClues.push(clue);
        } else {
            downClues.push(clue);
        }
    });

    // Generate HTML elements for "Across" clues
    const acrossCluesList = document.createElement("ul");
    acrossCluesList.innerHTML = "<h3>Across</h3>";
    acrossClues.forEach(clue => {
        const listItem = document.createElement("li");
        listItem.textContent = `${clue.position}. ${clue.clue}`;
        acrossCluesList.appendChild(listItem);
    });

    // Generate HTML elements for "Down" clues
    const downCluesList = document.createElement("ul");
    downCluesList.innerHTML = "<h3>Down</h3>";
    downClues.forEach(clue => {
        const listItem = document.createElement("li");
        listItem.textContent = `${clue.position}. ${clue.clue}`;
        downCluesList.appendChild(listItem);
    });

    // Append the clue lists to the document
    const cluesSection = document.querySelector(".clues");
    cluesSection.appendChild(acrossCluesList);
    cluesSection.appendChild(downCluesList);
}

// ... Your previous code ...

// Call the initialization function when the page loads
document.addEventListener("DOMContentLoaded", initializeCrossword);


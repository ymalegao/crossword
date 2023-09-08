import random
import json

class CrosswordPuzzle:
    def __init__(self, size=17, crossword_data=None):
        self.size = size
        self.grid = [[' ' for _ in range(size)] for _ in range(size)]
        self.words = []
        self.crossword_data = crossword_data
        self.word_positions = []

    def add_word(self, word, row, col, direction):
        word = word.upper()
        if not self.can_place_word(word, row, col, direction):
            return False  # Cannot place the word
        self.place_word(word, row, col, direction)
        self.words.append(word)
        return True

    def can_place_word(self, word, row, col, direction):
        if direction == 'horizontal':
            if col + len(word) > self.size:
                return False
            for k in range(len(word)):
                if self.grid[row][col + k] != ' ' and self.grid[row][col + k] != word[k]:
                    return False
        elif direction == 'vertical':
            if row + len(word) > self.size:
                return False
            for k in range(len(word)):
                if self.grid[row + k][col] != ' ' and self.grid[row + k][col] != word[k]:
                    return False
        return True

    def place_word(self, word, row, col, direction):
        if direction == 'horizontal':
            for k in range(len(word)):
                self.grid[row][col + k] = word[k]
                self.word_positions.append((row, col + k))
        elif direction == 'vertical':
            for k in range(len(word)):
                self.grid[row + k][col] = word[k]
                self.word_positions.append((row + k, col))


    def generate(self):
        if self.crossword_data is None:
            return False
        clues = self.crossword_data.get("clues", [])
        print(clues)
        for entry in clues:
            clue = entry.get("clue", "")
            answer = entry.get("answer", "").upper()  # Convert answer to uppercase
            row = entry.get("row", 0)
            col = entry.get("col", 0)
            direction = entry.get("direction", "horizontal")
            if self.add_word(answer, row, col, direction):
                print(f"Added word: {answer} (Clue: {clue})")

    def display(self):
        for row in self.grid:
            print(" ".join(row))

# Example usage:

if __name__ == "__main__":
    with open('crossword_data.json', 'r') as file:
        crossword_data = json.load(file)
    print(len(crossword_data))

    puzzle = CrosswordPuzzle(size=18, crossword_data=crossword_data)
    
    puzzle.generate()
    puzzle.display()

import { Injectable } from '@angular/core';
import { ITetromino } from './tetromis.component';
import { COLS, ROWS, PUNKTE } from './constants';

@Injectable({
  providedIn: 'root'
})
//Klasse validiert das sich der Block an einem legalen ort bewegt.
export class IsOnEdge {
  valid(p: ITetromino, board: number[][]): boolean {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return (
          this.isEmpty(value) ||
          (this.insideWalls(x) &&
            this.aboveFloor(y) &&
            this.notOccupied(board, x, y))
        );
      });
    });
  }

  isEmpty(value: number): boolean {
    return value === 0;
  }
//Hilfsmethode in einer Wand
  insideWalls(x: number): boolean {
    return x >= 0 && x < COLS;
  }
 //Hilfsmethode über dem Boden
  aboveFloor(y: number): boolean {
    return y <= ROWS;
  }
  //Standort nicht besetzt
  notOccupied(board: number[][], x: number, y: number): boolean {
    return board[y] && board[y][x] === 0;
  }

  //Score erhöhen
  getLinesClearedPoints(lines: number, level: number): number {
    const lineClearPoints =
      lines === 1
        ? PUNKTE.SINGLE
        : lines === 2
        ? PUNKTE.DOUBLE
        : lines === 3
        ? PUNKTE.TRIPLE
        : lines === 4
        ? PUNKTE.TETRIS
        : 0;

    return (level + 1) * lineClearPoints;
  }
}
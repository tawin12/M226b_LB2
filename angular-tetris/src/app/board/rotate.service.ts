import { Injectable } from '@angular/core';
import { ITetromino } from './tetromis.component';
import { COLS, ROWS, PUNKTE } from './constants';

@Injectable({
    providedIn: 'root'
  })
  //klasse ermöglicht als Service, dass Rotieren der Blöcke.
  export class TetromisRotation {

    rotate(piece: ITetromino): ITetromino {
        let p: ITetromino = JSON.parse(JSON.stringify(piece));
        for (let y = 0; y < p.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
        }
        }
        p.shape.forEach(row => row.reverse());
        return p;
    }

}
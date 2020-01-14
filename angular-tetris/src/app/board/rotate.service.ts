import { Injectable } from '@angular/core';
import { IPiece } from './tetromis.component';
import { COLS, ROWS, POINTS } from './constants';

@Injectable({
    providedIn: 'root'
  })
  export class TetromisRotation {

    rotate(piece: IPiece): IPiece {
        let p: IPiece = JSON.parse(JSON.stringify(piece));
        for (let y = 0; y < p.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
        }
        }
        p.shape.forEach(row => row.reverse());
        return p;
    }

}
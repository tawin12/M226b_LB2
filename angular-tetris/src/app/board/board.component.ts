import { Component, ViewChild, ElementRef, OnInit, HostListener} from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, KEYS, FARBEN, FORMEN } from './constants';
import { Piece, IPiece } from './tetromis.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

    @ViewChild('board', { static: true })
    canvas: ElementRef<HTMLCanvasElement>;

    ctx: CanvasRenderingContext2D;
    points: number;
    lines: number;
    level: number;
    board: number[][];
    piece: Piece;

    moves = {
      [KEYS.LEFT]:  (p: IPiece): IPiece => ({ ...p, x: p.x - 1 }),
      [KEYS.RIGHT]: (p: IPiece): IPiece => ({ ...p, x: p.x + 1 }),
      [KEYS.UP]:    (p: IPiece): IPiece => ({ ...p, y: p.y + 1 })
    };

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
      if (this.moves[event.keyCode]) {
        // If the keyCode exists in our moves stop the event from bubbling.
        event.preventDefault();
        // Get the next state of the piece.
        var p = this.moves[event.keyCode](this.piece);
        // Move the piece
        this.piece.move(p);
        // Clear the old position before drawing
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // Draw the new position.
        this.piece.draw();
      }
    }

    ngOnInit() {

      this.initBoard();

    }

    //Initialisiert das Board
    initBoard() {
      this.ctx = this.canvas.nativeElement.getContext('2d');
      this.ctx.canvas.width = COLS * BLOCK_SIZE;
      this.ctx.canvas.height = ROWS * BLOCK_SIZE;

      //Skaliert die alle Objekte
      this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE)
    }

    //Setzt das Board zurück und erstellt die Matrix
    getEmptyBoard(): number[][] {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    //Button um das spiel zu starten
    play() {

      //Ruft das Board auf
      this.board = this.getEmptyBoard();
      console.table(this.board);

      //Ruft das Formen objekt auf
      this.piece = new Piece(this.ctx);
      this.piece.draw();

    }


}

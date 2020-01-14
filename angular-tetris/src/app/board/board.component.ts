import { Component, ViewChild, ElementRef, OnInit, HostListener} from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, KEYS, FARBEN, FORMEN } from './constants';
import { Piece, IPiece } from './tetromis.component';
import {IsOnEdge} from './edge.service';
import {TetromisRotation} from './rotate.service';

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
      [KEYS.UP]:    (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
      [KEYS.SPACE]: (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
      [KEYS.UP]: (p: IPiece): IPiece => this.rotate.rotate(p)
    };

    time = { start: 0, elapsed: 0, level: 1000 };


    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
      // keyCode registrieren
      if (this.moves[event.keyCode]) {
        event.preventDefault();
        var p = this.moves[event.keyCode](this.piece);
        // tetromis bewegen

        if (this.edge.valid(p, this.board)) {
          this.piece.move(p);
        }

        if (event.keyCode === KEYS.SPACE) {
          while (this.edge.valid(p, this.board)) {
            p = this.moves[KEYS.DOWN](this.piece);
            this.piece.move(p);
          }
        }

        // Alte Position löschen
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // Neue Position
        //this.piece.draw();
      }
    }

    constructor(private edge: IsOnEdge, private rotate: TetromisRotation) {}

    ngOnInit() {

      this.initBoard();

    }
    


    animate(now = 0) {
      // Update elapsed time.
      this.time.elapsed = now - this.time.start;
      // If elapsed time has passed time for current level
      if (this.time.elapsed > this.time.level) {
        // Reset start time
        this.time.start = now;
        //this.drop();
      }
      this.draw();
      requestAnimationFrame(this.animate.bind(this));
    }

    drop(): boolean {
      let p = this.moves[KEYS.DOWN](this.piece);
      if (this.edge.valid(p, this.board)) {
        this.piece.move(p);
      } else {
        //this.freeze();
        //this.clearLines();
        if (this.piece.y === 0) {
          // Game over
          return false;
        }
        //this.piece = this.next;
        //this.next = new Piece(this.ctx);
        //this.next.drawNext(this.ctxNext);
      }
      return true;
    }


    draw() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.piece.draw();
      this.drawBoard();
    }

    drawBoard() {
      this.board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.ctx.fillStyle = FARBEN[value];
            this.ctx.fillRect(x, y, 1, 1);
          }
        });
      });
    }


    //Initialisiert das Board
    initBoard() {
      this.ctx = this.canvas.nativeElement.getContext('2d');
      this.ctx.canvas.width = COLS * BLOCK_SIZE;
      this.ctx.canvas.height = ROWS * BLOCK_SIZE;

      //Skaliert die alle Objekte
      this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE)
    }

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
      //this.piece.draw();
      this.animate();

    }


}

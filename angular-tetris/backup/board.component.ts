import { Component, ViewChild, ElementRef, OnInit, HostListener} from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, KEYS, FARBEN, FORMEN, PUNKTE, LEVEL } from './constants';
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
    @ViewChild('next', { static: true })
    ctx: CanvasRenderingContext2D;
    canvasNext: ElementRef<HTMLCanvasElement>
    ctxNext: CanvasRenderingContext2D;
    points: number;
    lines: number;
    level: number;
    board: number[][];
    piece: Piece;
    requestId: number;
    next: Piece;

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
      if (event.keyCode === KEYS.ESC) {
        this.gameOver();
      } else if (this.moves[event.keyCode]) {
        event.preventDefault();
        // Get new state
        let p = this.moves[event.keyCode](this.piece);
        if (event.keyCode === KEYS.SPACE) {
          // Hard drop
          while (this.edge.valid(p, this.board)) {
            this.points += PUNKTE.HARD_DROP;
            this.piece.move(p);
            p = this.moves[KEYS.DOWN](this.piece);
          }
        } else if (this.edge.valid(p, this.board)) {
          this.piece.move(p);
          if (event.keyCode === KEYS.DOWN) {
            this.points += PUNKTE.SOFT_DROP;
          }
        }
      }
    }

    constructor(private edge: IsOnEdge, private rotate: TetromisRotation) {}

    ngOnInit() {

      this.initBoard();
      this.initNext();
      this.resetGame();

    }
    
    animate(now = 0) {
      this.time.elapsed = now - this.time.start;
      if (this.time.elapsed > this.time.level) {
        this.time.start = now;
        if (!this.drop()) {
          this.gameOver();
          return;
        }
      }
      this.draw();
      this.requestId = requestAnimationFrame(this.animate.bind(this));
    }

    drop(): boolean {
      let p = this.moves[KEYS.SPACE](this.piece);
      if (this.edge.valid(p, this.board)) {
        this.piece.move(p);
      } else {
        this.freeze();
        this.clearLines();
        if (this.piece.y === 0) {
          // Game over
          return false;
        }
        this.piece = this.next;
        this.next = new Piece(this.ctx);
        this.next.drawNext(this.ctxNext);
      }
      return true;
    }

    freeze() {
      this.piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.board[y + this.piece.y][x + this.piece.x] = value;
          }
        });
      });
    }

    clearLines() {
      let lines = 0;
      this.board.forEach((row, y) => {
        if (row.every(value => value !== 0)) {
          lines++;
          this.board.splice(y, 1);
          this.board.unshift(Array(COLS).fill(0));
        }
      });
      if (lines > 0) {
        this.points += this.edge.getLinesClearedPoints(lines, this.level);
        this.lines += lines;
        if (this.lines >= 10) {
          this.level++;
          this.lines -= 10;
          this.time.level = LEVEL[this.level];
        }
      }
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

    initNext() {
      this.ctxNext = this.canvasNext.nativeElement.getContext('2d');
  
      // Calculate size of canvas from constants.
      this.ctxNext.canvas.width = 4 * BLOCK_SIZE + 2;
      this.ctxNext.canvas.height = 4 * BLOCK_SIZE;
  
      this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
    }
    

    getEmptyBoard(): number[][] {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    //Button um das spiel zu starten
    play() {

    this.resetGame();
    this.next = new Piece(this.ctx);
    this.piece = new Piece(this.ctx);
    this.next.drawNext(this.ctxNext);
    this.time.start = performance.now();

    // If we have an old game running a game then cancel the old
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }

    this.animate();

    }

    gameOver() {
      cancelAnimationFrame(this.requestId);
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(1, 3, 8, 1.2);
      this.ctx.font = '1px Arial';
      this.ctx.fillStyle = 'red';
      this.ctx.fillText('GAME OVER', 1.8, 4);
    }

    resetGame() {
      this.points = 0;
      this.lines = 0;
      this.level = 0;
      this.board = this.getEmptyBoard();
      this.time = { start: 0, elapsed: 0, level: LEVEL[this.level] };
    }
  
  }
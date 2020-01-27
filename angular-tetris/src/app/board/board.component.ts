import { Component, ViewChild, ElementRef, OnInit, HostListener} from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, KEYS, FARBEN, FORMEN, PUNKTE, LEVEL, LINES_PER_LEVEL } from './constants';
import { Tetromino, ITetromino } from './tetromis.component';
import {IsOnEdge} from './edge.service';
import {TetromisRotation} from './rotate.service';

/**
 *
 * Component für das Spielfeld
 * @export
 * @class BoardComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @ViewChild('board', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('next', { static: true })
  canvasNext: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  ctxNext: CanvasRenderingContext2D;
  board: number[][];
  piece: Tetromino;
  next: Tetromino;
  requestId: number;
  paused: boolean;
  gameStarted: boolean;
  time: { start: number; elapsed: number; level: number };
  points: number;
  highScore: number;
  lines: number;
  level: number;
  moves = {
    [KEYS.LEFT]: (p: ITetromino): ITetromino => ({ ...p, x: p.x - 1 }),
    [KEYS.RIGHT]: (p: ITetromino): ITetromino => ({ ...p, x: p.x + 1 }),
    [KEYS.DOWN]: (p: ITetromino): ITetromino => ({ ...p, y: p.y + 1 }),
    [KEYS.SPACE]: (p: ITetromino): ITetromino => ({ ...p, y: p.y + 1 }),
    [KEYS.UP]: (p: ITetromino): ITetromino => this.rotate.rotate(p)
  };

  /**
   *
   * Pfeiltasten Steuerung für die Blöcke.
   * @param {KeyboardEvent} event
   * @memberof BoardComponent
   */
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

  /**
   *Erstellt eine instanz von BoardComponent.
   * @param {IsOnEdge} edge
   * @param {TetromisRotation} rotate
   * @memberof BoardComponent
   */
  constructor(private edge: IsOnEdge, private rotate: TetromisRotation) {}

  /**
   *
   * Ruft methoden bei Initialisierung auf.
   * @memberof BoardComponent
   */
  ngOnInit() {
    this.initBoard();
    this.initNext();
    this.resetGame();
    this.highScore = 0;
  }
  /**
   * Initialisiert das Board
   *
   * @memberof BoardComponent
   */
  initBoard() {
    this.ctx = this.canvas.nativeElement.getContext('2d');

    // Rechnet die Block grössen aus
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;

    //Skaliert die alle Objekte
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  /**
   * Initialisiert den nächsten Block
   *
   * @memberof BoardComponent
   */
  initNext() {
    this.ctxNext = this.canvasNext.nativeElement.getContext('2d');

    // Grösse von nächsten Blöcken ausrechnen
    this.ctxNext.canvas.width = 4 * BLOCK_SIZE + 2;
    this.ctxNext.canvas.height = 4 * BLOCK_SIZE;

    this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
  }
  
  /**
   *Button um das spiel zu starten
   *
   * @memberof BoardComponent
   */

  play() {
    this.gameStarted = true;
    this.resetGame();
    this.next = new Tetromino(this.ctx);
    this.piece = new Tetromino(this.ctx);
    this.next.drawNext(this.ctxNext);
    this.time.start = performance.now();

    // Bei gleicher Request ID Animation abbrechen
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
    //Animiert die Blöcke
    this.animate();
  }

  /**
   *Spiel zurücksetzen
   *
   * @memberof BoardComponent
   */
  resetGame() {
    this.points = 0;
    this.lines = 0;
    this.level = 0;
    this.board = this.getEmptyBoard();
    this.time = { start: 0, elapsed: 0, level: LEVEL[this.level] };
    this.paused = false;
  }
  
  /**
   *
   *Animationsloop der dropbewegung
   * @param {number} [now=0]
   * @returns
   * @memberof BoardComponent
   */
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

  /**
   * Zeichnen der Blöcke
   *
   * @memberof BoardComponent
   */
  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.piece.draw();
    this.drawBoard();
  }

  /**
   *Zeichnen des Boardes
   *
   * @memberof BoardComponent
   */
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

  /**
   *
   * Abwärts bewegung
   * @returns {boolean}
   * @memberof BoardComponent
   */
  drop(): boolean {
    let p = this.moves[KEYS.DOWN](this.piece);
    if (this.edge.valid(p, this.board)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();
      if (this.piece.y === 0) {
        // Spiel beenden falls "Dach" erreicht
        return false;
      }
      this.piece = this.next;
      this.next = new Tetromino(this.ctx);
      this.next.drawNext(this.ctxNext);
    }
    return true;
  }
  
  /**
   *
   *Bei 10 Blöcken neben einander die Linie Löschen und den Score erhöhen
   * @memberof BoardComponent
   */
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
      if (this.lines >= LINES_PER_LEVEL) {
        this.level++;
        this.lines -= LINES_PER_LEVEL;
        this.time.level = LEVEL[this.level];
      }
    }
  }

  /**
   *
   * Block einfrieren wenn unten angekommen
   * @memberof BoardComponent
   */
  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  /**
   *
   * Spiel Verloren.
   * @memberof BoardComponent
   */
  gameOver() {
    this.gameStarted = false;
    cancelAnimationFrame(this.requestId);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(1, 3, 8, 1.2);
    this.ctx.font = '1px Arial';
    this.ctx.fillStyle = 'red';
    this.ctx.fillText('GAME OVER', 1.8, 4);
  }
  
  /**
   *
   * Leeres Matrix board erstellen
   * @returns {number[][]}
   * @memberof BoardComponent
   */
  getEmptyBoard(): number[][] {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }
}

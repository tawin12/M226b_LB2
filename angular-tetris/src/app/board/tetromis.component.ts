import { FARBEN, FORMEN } from './constants';

/**
 *
 * Interface für Tetromino löschen
 * @export
 * @interface ITetromino
 */
export interface ITetromino {
  x: number;
  y: number;
  color: string;
  shape: number[][];
}

/**
 *
 * Klasse Tetromino erstellen
 * @export
 * @class Tetromino
 * @implements {ITetromino}
 */
export class Tetromino implements ITetromino {
  x: number;
  y: number;
  color: string;
  shape: number[][];

  /**
   * Erstellt eine Instant von Tetronomis.
   * @param {CanvasRenderingContext2D} ctx
   * @memberof Tetromino
   */
  constructor(private ctx: CanvasRenderingContext2D) {
    this.spawn();
  }

  /**
   *
   * Spawnt einen Block.
   * @memberof Tetromino
   */
  spawn() {
    const typeId = this.randomizeTetrominoType(FARBEN.length - 1);
    this.shape = FORMEN[typeId];
    this.color = FARBEN[typeId];
    this.x = typeId === 4 ? 4 : 3;
    this.y = 0;
  }

  /**
   *
   * Zeichnet einen Block in der Farbe
   * @memberof Tetromino
   */
  draw() {
    this.ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  /**
   *
   * Zeichnet den nächsten Block.
   * @param {CanvasRenderingContext2D} ctxNext
   * @memberof Tetromino
   */
  drawNext(ctxNext: CanvasRenderingContext2D) {
    ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);
    ctxNext.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          ctxNext.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  /**
   *
   * Bewegt einen Block
   * @param {ITetromino} p
   * @memberof Tetromino
   */
  move(p: ITetromino) {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  /**
   *
   * Zufälliger Blocktyp generieren
   * @param {number} noOfTypes
   * @returns {number}
   * @memberof Tetromino
   */
  randomizeTetrominoType(noOfTypes: number): number {
    return Math.floor(Math.random() * noOfTypes + 1);
  }
}
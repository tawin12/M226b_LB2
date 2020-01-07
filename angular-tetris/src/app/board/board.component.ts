import { Component, ViewChild, ElementRef, OnInit, HostListener} from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS } from './constants';
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

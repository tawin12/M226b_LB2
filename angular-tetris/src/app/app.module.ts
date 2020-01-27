import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { StartComponent } from './start/start.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
   path: 'board',
   component: BoardComponent
  },
  {
    path: '',
    component: StartComponent
  }

];

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    StartComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

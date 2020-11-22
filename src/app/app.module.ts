import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { TodoItemComponent } from './todo-item/todo-item.component';
import {TodoService} from './todo.service';
import { FormsModule } from '@angular/forms';
import { DragDropDirective } from './drag-drop/drag-drop';


@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent,
    TodoItemComponent,
    DragDropDirective
  ],
  imports: [
    BrowserModule, FormsModule, NgxQRCodeModule
  ],
  providers: [TodoService],
  bootstrap: [AppComponent]
})
export class AppModule { }

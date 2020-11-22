import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { HeaderComponent } from './header/header.component';
import { SignupComponent } from './firebase-signup/firebase-signup.component';
import { SigninComponent } from './firebase-signin/firebase-signin.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { TodoItemComponent } from './todo-item/todo-item.component';
import { TodoService } from './todo.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropDirective } from './drag-drop/drag-drop';
import { AuthService } from './firebase.authservice';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent,
    TodoItemComponent,
    DragDropDirective,
    HeaderComponent,
    SignupComponent,
    SigninComponent
  ],
  imports: [
    BrowserModule, FormsModule, NgxQRCodeModule, ReactiveFormsModule, NgbModule
  ],
  providers: [TodoService, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodoService } from './todo.service';
import { TodoListData } from './dataTypes/TodoListData';
import { TodoItemData } from './dataTypes/TodoItemData';
import firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyAdAg5tX7_y8-Id262WZCPFtjR7uOMa-6Y",
      authDomain: "pwaprojet-f6b2e.firebaseapp.com",
      databaseURL: "https://pwaprojet-f6b2e.firebaseio.com",
      projectId: "pwaprojet-f6b2e",
      storageBucket: "pwaprojet-f6b2e.appspot.com",
      messagingSenderId: "96897086111",
      appId: "1:96897086111:web:7a982bbd4aa2f7193e68aa"
    };
    firebase.initializeApp(firebaseConfig);
  }
}

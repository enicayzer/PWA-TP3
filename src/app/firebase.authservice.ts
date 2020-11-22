import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Observable, BehaviorSubject } from 'rxjs';
import { promise } from 'protractor';

@Injectable()
export class AuthService {

  constructor() {
  }

  isAuthentifier(): Observable<boolean> {
    return Observable.create(obs => {
      return firebase.auth().onAuthStateChanged(
        user => obs.next(user != null ? true : false),
        err => obs.error(false),
        () => obs.complete());
    });
  }


  createNewUser(email: string, password: string) {
    return new Promise(
      (resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  signInUser(email: string, password: string) {
    return new Promise(
      (resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(email, password).then(
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  signOutUser() {
    return new Promise(
      (resolve, reject) => {
        firebase.auth().signOut().then(
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }
}

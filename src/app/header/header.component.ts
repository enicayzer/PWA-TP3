import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../firebase.authservice';
import firebase from 'firebase';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isAuth: boolean;
  closeResult: string;
  email: string;

  constructor(private authService: AuthService, private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.authService.isAuthentifier().subscribe(
      user => {
        this.isAuth = user;
        if (user) {
          this.email = firebase.auth().currentUser.email;
        }
        this.cdr.detectChanges();
      },
      err => {
        this.isAuth = false;
      }
    );
  }

  ngOnInit() {

  }

  onSignOut() {
    this.authService.signOutUser().then(
      () => {
      },
      (error) => {
      }
    );
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      if (reason == "auth") {
        this.cdr.detectChanges();
      }
    });
  }

}

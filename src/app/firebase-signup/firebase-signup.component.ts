import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../firebase.authservice';

@Component({
  selector: 'app-firebase-signup',
  templateUrl: './firebase-signup.component.html',
  styleUrls: ['./firebase-signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  errorMessage: string;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService, public modalService: NgbModal) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)]]
    });
  }

  /*
   * Méthode de création d'un nouvel utilisateur
   */
  onSubmit() {
    const email = this.signupForm.get('email').value;
    const password = this.signupForm.get('password').value;

    this.authService.createNewUser(email, password).then(
      () => {
        this.modalService.dismissAll("auth");
      },
      (error) => {
        this.errorMessage = error;
      }
    );
  }
}

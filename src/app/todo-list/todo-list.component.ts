import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { TodoListData } from '../dataTypes/TodoListData';
import { TodoItemData } from '../dataTypes/TodoItemData';
import { TodoService } from '../todo.service';
import { AuthService } from '../firebase.authservice';
import { State } from "../enums/State";
import qrcodeParser from 'qrcode-parser';
import firebase from 'firebase';
import Datasnapshot = firebase.database.DataSnapshot;

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})

export class TodoListComponent implements OnInit {

  @ViewChild('searchKey', { static: false }) searchKey: ElementRef;
  @Input() private data: TodoListData;

  private titre: string;
  // Utilisation d'un Enum pour les états des filtres (tous, actif, complete)
  private state = State;
  // Par défaut l'état du filtre est à "tous"
  private filter: State = State.all;

  // Historique
  private compteurRetour: number = 0;
  private dataHistory: TodoListData[] = [];
  private bloquerHistorique: boolean = false;

  // Reconnaissance vocale
  isSpeechOpen: boolean = false;
  recognition: any = null;

  //QR Code
  title: string = 'app';
  elementTypeQRCode: string = 'img';
  valueQRCode: string = '';
  qrCodeEstAfficher: boolean = false;

  //Auth firebase
  private isAuth: boolean = false;
  private bloqueSaveFirebase: boolean = false;


  constructor(private authService: AuthService, private todoService: TodoService, private cdr: ChangeDetectorRef) {
    // On récupère le titre du label pour la clé "localstorage"
    this.titre = todoService.getLabelName();
    // On charge les données lors de la 1ère init
    this.chargeLocalDonnees();

    this.authService.isAuthentifier().subscribe(
      user => {
        // On charge les données de l'user 
        if (!this.isAuth && user) {
          this.getFirebaseData();
        }
        this.isAuth = user;
      }
    );

    todoService.getTodoListDataObservable().subscribe(
      tdl => {
        this.data = tdl;
        // Pour chaque changement on sauvegarde la liste locale
        this.sauvegardeLocale();
        // Sauvegarde dans le firebase si connecté
        this.saveFirebaseData();
      }
    );

  }

  ngOnInit() {

  }

  appendItem(label: string, isDone = false, auto = false): void {
    if (label != "") {
      if (!auto) {
        // Réinitialisation du compteur historique 
        this.compteurRetour = 0;
      }
      this.todoService.appendItems(
        {
          label, isDone
        });
    }
  }

  /*
   * Création d'une instance de reconnaissance vocale puis récupération de la valeur 
   */
  reconnaissanceVocale(): void {
    var self = this;
    // Si micro déjà ouvert
    if (this.isSpeechOpen) {
      this.recognition.stop();
      return;
    }
    this.parametresReconnaissanceVocale();
    this.recognition.onresult = function (e) {
      var texteParler = e.results[0][0].transcript;
      self.appendItem(texteParler, false, true);
      self.isSpeechOpen = false;
      this.stop();
      // Obligatoire pour obtenir les changements
      self.cdr.detectChanges();
    };
    this.recognition.stop = function (e) {
      self.isSpeechOpen = false;
      // Obligatoire pour obtenir les changements
      self.cdr.detectChanges();
    };
    this.recognition.end = function (e) {
      this.stop();
    }
    this.recognition.onerror = function (e) {
      this.stop();
    }
  }

  /* Affectation des paramètres reconnaissance vocale */
  parametresReconnaissanceVocale() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = 'fr-FR';
    this.recognition.interimResults = false;
    this.recognition.continous = true;
    this.recognition.start();
    this.isSpeechOpen = true;
  }

  setItemDone(item: TodoItemData, done: boolean): void {
    this.todoService.setItemsDone(done, item);
  }

  itemLabel(item: TodoItemData, label: string): void {
    this.todoService.setItemsLabel(label, item);
  }

  removeItem(item: TodoItemData): void {
    this.todoService.removeItems(item);
  }

  get label(): string {
    return this.data.label;
  }

  get items(): TodoItemData[] {
    return this.data.items;
  }

  /*
   * Vérifie les items sélectionnés
   */
  isAllDone(): boolean {
    return this.items.every(it => it.isDone);
  }

  /*
   * Sélectionne tous les items
   */
  toggleAllDone() {
    const done = !this.isAllDone();
    this.todoService.setItemsDone(done, ...this.items);
  }

  compteurItems(): number {
    return (this.items.length - this.items.filter(item => item.isDone).length);
  }


  setFiltre(value) {
    this.filter = value;
  }

  /*
   * Affichage d'un item en fonction de l'état des filtres sélectionnées
   */
  estItemAffiche(item) {
    if ((this.filter === State.all) ||
      (this.filter === State.actived && !item.isDone) ||
      (this.filter === State.completed && item.isDone)) {
      return true;
    }
    return false;
  }

  /*
   * Méthode de vérification de l'état du filtre 
   */
  checkState(state: State) {
    if (state == this.filter) {
      return true;
    }
    return false;
  }

  /*
   * On récupère si il y a une ou plusieurs coche
   */
  isItemCoches(): boolean {
    return this.items.filter(x => x.isDone).length > 0;
  }

  /*
   * Méthode de suppression des items cochés
   */
  supprimeItemCoches() {
    // On récupère la liste des items cochés et on boucle dans un foreach pour supprimer chaque item
    this.items.filter(x => x.isDone).forEach(item => {
      this.removeItem(item);
    });
  }


  /*
  * Méthode de suppression de tous les items
  */
  supprimeTousItems() {
    // On récupère la liste des items et on boucle dans un foreach pour supprimer chaque item
    this.items.forEach(item => {
      this.removeItem(item);
    });
  }

  /*
   * Méthode qui vérifie si on peut annuler 
   */
  isAnnuler() {
    return this.dataHistory.length > this.compteurRetour + 1;
  }

  /*
   * Méthode qui vérifie si on peut effectuer un refaire
   */
  isRefaire() {
    return this.compteurRetour > 0;
  }


  /*
   * Methode qui annule ou refait un événement de l'utilisateur avec en paramètre isAnnuler = true alors il s'agit d'un annuler sinon refaire
   */
  annulerRefaireItems(isAnnuler: boolean) {
    this.bloquerHistorique = true;
    this.compteurRetour = isAnnuler ? this.compteurRetour + 1 : this.compteurRetour - 1;
    var dataModifie = this.dataHistory[this.dataHistory.length - 1 - this.compteurRetour];
    this.supprimeTousItems();
    this.appendItemsByData(dataModifie.items);
    this.bloquerHistorique = false;
  }

  /*
   * Sauvegarde en local des items avec comme clé le nom du label
   */
  sauvegardeLocale() {
    localStorage.setItem(this.label, JSON.stringify(this.items));
    // On ne sauvegarde pas si on est dans un "refaire" ou "annuler" 
    if (!this.bloquerHistorique) {
      this.dataHistory.push(this.data);
    }
  }

  /*
   * Remise à zéro de l'historique lors de l'authentification avec firebase
   */
  remiseAZeroHistorique() {
    this.dataHistory = [];
    this.sauvegardeLocale();
    this.compteurRetour = 0;
  }

  /*
   * Chargement des données depuis le local storage
   */
  chargeLocalDonnees() {
    this.appendItemsByData(JSON.parse(localStorage.getItem(this.titre)));
  }

  /*
   * Suppression du local storage 
   */
  supprimerLocalStorage() {
    localStorage.removeItem(this.titre);
  }

  /*
   * On ajoute des items depuis une liste d'items
   */
  appendItemsByData(datas: TodoItemData[]): void {
    if (datas != null && datas.length > 0) {
      datas.forEach(x => this.appendItem(x.label, x.isDone, true));
    }
  }


/* Cacher QR Code */
  estCacherQRCode(): boolean {
    return this.qrCodeEstAfficher;
  }

  cacherQRCode(): void {
    this.qrCodeEstAfficher = false;
  }

  /* Génération du QRCode*/
  genererQRCode(): void {
    // Seulement si il existe au moins 1 item
    if (this.items.length > 0) {
      this.valueQRCode = JSON.stringify(this.items);
      this.qrCodeEstAfficher = true;
    }
  }

  /* Upload du QRCode en drag & drop*/
  uploadDragAndDrop(event): void {
    qrcodeParser(event[0]).then(x => {
      this.appendItemsByData(JSON.parse(x.data));
      // Obligatoire pour obtenir les changements
      this.cdr.detectChanges();
    }).catch(function (err) {
      // En cas d'erreur de lecture du QR Code on affiche ce message
      alert("Impossible de décoder ce QR Code");
    });
  }

  /* Upload du QR Code en cliquant sur la zone */
  uploadQRCode(event): void {
    this.uploadDragAndDrop(event.target.files);
  }


  /** Utilisation de firebase **/
  /* Sauvegarde des données dans firebase*/
  saveFirebaseData() {
    if (this.isAuth && !this.bloqueSaveFirebase) {
      var userId = firebase.auth().currentUser.uid;
      firebase.database().ref("/users/" + userId + "/" + this.titre).set(this.items);
    }
  }

  /* Récupération des données dans firebase*/
  getFirebaseData() {
    var userId = firebase.auth().currentUser.uid;
    const ref = firebase.database().ref("/users/" + userId + "/" + this.titre);
    ref.once('value', (data: Datasnapshot) => {
      var datas = data.val() ? data.val() : [];
      this.bloqueSaveFirebase = true;
      this.supprimeTousItems();
      this.appendItemsByData(datas);
      this.remiseAZeroHistorique();
      this.bloqueSaveFirebase = false;
      this.cdr.detectChanges();
    });
  }
}


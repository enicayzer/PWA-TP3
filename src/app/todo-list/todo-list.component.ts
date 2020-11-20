import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { TodoListData } from '../dataTypes/TodoListData';
import { TodoItemData } from '../dataTypes/TodoItemData';
import { TodoService } from '../todo.service';
import { State } from "../enums/State";

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
  private compteurRetour = 0;
  private dataHistory: TodoListData[] = [];
  private bloquerHistorique = false;
  private isSpeechOpen = false;


  constructor(private todoService: TodoService, private cdr: ChangeDetectorRef) {
    // On récupère le titre du label pour la clé "localstorage"
    this.titre = todoService.getLabelName();
    // On charge les données lors de la 1ère init
    this.chargeLocalDonnees();
    todoService.getTodoListDataObservable().subscribe(
      tdl => {
        this.data = tdl;
        // Pour chaque changement on sauvegarde la liste locale
        this.sauvegardeLocale();
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
    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.continous = false;
    recognition.start();
    this.isSpeechOpen = true;
    recognition.onresult = function (e) {
      var texteParler = e.results[0][0].transcript;
      self.appendItem(texteParler, false, true);
      self.isSpeechOpen = false;
      recognition.stop();
      // Obligatoire pour obtenir les changements
      self.cdr.detectChanges();
    };
    recognition.stop = function (e) {
      self.isSpeechOpen = false;
    };
    recognition.onerror = function (e) {
      self.isSpeechOpen = false;
      recognition.stop();
    }
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

  isAnnuler() {
    return this.dataHistory.length > this.compteurRetour + 1;
  }

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
   * Chargement des données depuis le local storage
   */
  chargeLocalDonnees() {
    this.appendItemsByData(JSON.parse(localStorage.getItem(this.titre)));
  }

  /*
   * On ajoute des items depuis une liste d'items
   */
  appendItemsByData(datas: TodoItemData[]): void {
    if (datas != null && datas.length > 0) {
      datas.forEach(x => this.appendItem(x.label, x.isDone, true));
    }
  }
}


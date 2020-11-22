import { Directive, Output, Input, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {

  @Output() onFileDropped = new EventEmitter<any>();

  /* Class css qui vont changer l'opacité et la couleur de fond*/
  @HostBinding('class.hoverDrop') private hoverDropClass = true;
  @HostBinding('class.dragOver') private dragOverClass = false;

  //Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragOverClass = true;
    this.hoverDropClass = false;
  }

  //Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragOverClass = false;
    this.hoverDropClass = true;
  }

  //Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragOverClass = false;
    this.hoverDropClass = true;
    const items = evt.dataTransfer.items;
    let files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.onFileDropped.emit(files)
    }
  }

}

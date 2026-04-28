import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-action-menu',
  standalone: false,
  templateUrl: './actionMenu.component.html',
  styleUrls: ['./actionMenu.component.css'],
})
export class ActionMenuComponent {
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}

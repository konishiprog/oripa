import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ShippingConfirmDialogData {
  cardCount: number;
}

@Component({
  selector: 'app-shipping-confirm-dialog',
  templateUrl: './shippingConfirmDialog.component.html',
  styleUrls: [
    './shippingConfirmDialog.component.css',
    './shippingConfirmDialog.responsive.component.css',
  ],
  standalone: false,
})
export class ShippingConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ShippingConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShippingConfirmDialogData,
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

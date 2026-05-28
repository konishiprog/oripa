import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface CoinExchangeDialogData {
  points: number;
}

@Component({
  selector: 'app-coin-exchange-dialog',
  templateUrl: './coinExchangeDialog.component.html',
  styleUrls: [
    './coinExchangeDialog.component.css',
    './coinExchangeDialog.responsive.component.css',
  ],
  standalone: false,
})
export class CoinExchangeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CoinExchangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CoinExchangeDialogData,
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

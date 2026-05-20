import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

export interface ConfirmDialogData {
  labelKey: string;
}

@Component({
  selector: 'app-confirm-update-dialog',
  templateUrl: './confirm-update-dialog.component.html',
  styleUrls: ['./confirm-update-dialog.component.css'],
  standalone: false,
})
export class ConfirmUpdateDialogComponent {
  constructor(
    private translateService: TranslateService,
    public dialogRef: MatDialogRef<ConfirmUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

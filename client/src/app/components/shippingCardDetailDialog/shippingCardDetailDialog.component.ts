import { Component, Inject, OnInit, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ShippingCardInfo } from '../../service/shipping-info.service';

export interface ShippingCardDetailDialogData {
  card: ShippingCardInfo;
}

@Component({
  selector: 'app-shipping-card-detail-dialog',
  standalone: false,
  templateUrl: './shippingCardDetailDialog.component.html',
  styleUrls: [
    './shippingCardDetailDialog.component.css',
    './shippingCardDetailDialog.responsive.component.css',
  ],
})
export class ShippingCardDetailDialogComponent implements OnInit {
  card!: ShippingCardInfo;
  isLoading: boolean = false;

  constructor(
    private translateService: TranslateService,
    @Optional()
    private dialogRef: MatDialogRef<ShippingCardDetailDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    private data: ShippingCardDetailDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.card = this.data.card;
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShippingCardInfo } from '../../service/shipping-info.service';
import { ShipmentPayload } from '../../service/card.service';

export interface ShippingConfirmDialogData {
  cards?: ShippingCardInfo[];
  cardCount?: number;
  isFromAdmin?: boolean;
}

interface DialogTableHeader {
  key: string;
  labelKey: string;
}

const DIALOG_TABLE_HEADERS: DialogTableHeader[] = [
  { key: 'user-name', labelKey: 'shipping-info.table.user-name' },
  { key: 'address', labelKey: 'shipping-info.table.address' },
  { key: 'phone', labelKey: 'shipping-info.table.phone' },
  { key: 'card-info', labelKey: 'shipping-info.table.card-info' },
];

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
  cards: ShippingCardInfo[];
  tableHeaders = DIALOG_TABLE_HEADERS;
  trackingByDestination: { [destinationKey: string]: string } = {};
  isFromAdmin: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ShippingConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShippingConfirmDialogData,
  ) {
    this.cards = data?.cards || [];
    this.isFromAdmin = data?.isFromAdmin ?? data?.cards !== undefined;
    this.cards.forEach((card) => {
      const destinationKey = this.getDestinationKey(card);
      if (this.trackingByDestination[destinationKey] === undefined) {
        this.trackingByDestination[destinationKey] = '';
      }
    });
  }

  getDestinationKey(card: ShippingCardInfo): string {
    return card.userId;
  }

  getCellValue(card: ShippingCardInfo, key: string): string {
    switch (key) {
      case 'user-name':
        return card.userName;
      case 'address':
        return card.address;
      case 'phone':
        return card.phone;
      case 'card-info':
        return `${card.cardName}(${card.gachaName})`;
      default:
        return '';
    }
  }

  isAllTrackingFilled(): boolean {
    return Object.values(this.trackingByDestination).every(
      (trackingNumber) => trackingNumber.trim() !== '',
    );
  }

  onConfirm(): void {
    if (!this.isAllTrackingFilled()) {
      return;
    }

    const shipments: ShipmentPayload[] = this.cards.map((card) => ({
      cardId: card.cardId,
      trackingNumber:
        this.trackingByDestination[this.getDestinationKey(card)].trim(),
    }));

    this.dialogRef.close(shipments);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

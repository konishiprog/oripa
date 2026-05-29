import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

export type GachaSortOrder =
  | 'newest'
  | 'cost-high'
  | 'cost-low'
  | 'remaining-high'
  | 'remaining-low';

export interface GachaSortDialogData {
  sortOrder: GachaSortOrder;
}

@Component({
  selector: 'app-gacha-sort-dialog',
  standalone: false,
  templateUrl: './gachaSortDialog.component.html',
  styleUrls: [
    './gachaSortDialog.component.css',
    './gachaSortDialog.responsive.component.css',
  ],
})
export class GachaSortDialogComponent implements OnInit {
  selectedOrder: GachaSortOrder = 'newest';

  sortOptions: GachaSortOrder[] = [
    'newest',
    'cost-high',
    'cost-low',
    'remaining-high',
    'remaining-low',
  ];

  constructor(
    private translateService: TranslateService,
    @Optional() private dialogRef: MatDialogRef<GachaSortDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: GachaSortDialogData,
  ) {
    if (data?.sortOrder) {
      this.selectedOrder = data.sortOrder;
    }
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  getTranslationKey(order: GachaSortOrder): string {
    const keyMap: Record<GachaSortOrder, string> = {
      newest: 'user-gacha.sort-dialog.newest',
      'cost-high': 'user-gacha.sort-dialog.cost-high',
      'cost-low': 'user-gacha.sort-dialog.cost-low',
      'remaining-high': 'user-gacha.sort-dialog.remaining-high',
      'remaining-low': 'user-gacha.sort-dialog.remaining-low',
    };
    return keyMap[order];
  }

  selectOption(order: GachaSortOrder): void {
    this.selectedOrder = order;
    this.dialogRef?.close(order);
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}

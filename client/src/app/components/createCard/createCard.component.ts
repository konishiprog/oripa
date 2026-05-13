import {
  Component,
  ChangeDetectorRef,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CardService } from '../../service/card.service';

export interface CreateCardDialogData {
  gachaId: number;
  gachaName: string;
}

export const CARD_TYPES = [
  { value: 'SSR', labelKey: 'card-create.card-type-ssr' },
  { value: 'SR', labelKey: 'card-create.card-type-sr' },
  { value: 'R', labelKey: 'card-create.card-type-r' },
  { value: 'N', labelKey: 'card-create.card-type-n' },
  { value: 'LAST', labelKey: 'card-create.card-type-last' },
];

export const EXCHANGE_TYPES = [
  { value: 'SHIPPING_ONLY', labelKey: 'card-create.exchange-type-shipping-only' },
  { value: 'BOTH', labelKey: 'card-create.exchange-type-both' },
];

@Component({
  selector: 'app-create-card',
  standalone: false,
  templateUrl: './createCard.component.html',
  styleUrls: ['./createCard.component.css'],
})
export class CreateCardComponent implements OnInit {
  name: string = '';
  cardType: string = 'SSR';
  exchangeType: string = 'SHIPPING_ONLY';
  imageFrontFile: File | null = null;
  imageFrontPreview: SafeUrl | null = null;
  imageBackFile: File | null = null;
  imageBackPreview: SafeUrl | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  cardTypes = CARD_TYPES;
  exchangeTypes = EXCHANGE_TYPES;

  constructor(
    private cardService: CardService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    @Optional() private dialogRef: MatDialogRef<CreateCardComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CreateCardDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
  }

  onImageFrontSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) {
      this.imageFrontFile = null;
      this.imageFrontPreview = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.showError('card-create.error-invalid-image');
      event.target.value = '';
      return;
    }

    this.imageFrontFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageFrontPreview = this.sanitizer.bypassSecurityTrustUrl(
        e.target?.result as string,
      );
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  onImageBackSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) {
      this.imageBackFile = null;
      this.imageBackPreview = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.showError('card-create.error-invalid-image');
      event.target.value = '';
      return;
    }

    this.imageBackFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageBackPreview = this.sanitizer.bypassSecurityTrustUrl(
        e.target?.result as string,
      );
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    if (
      !this.name ||
      !this.cardType ||
      !this.exchangeType ||
      !this.imageFrontFile ||
      !this.imageBackFile
    ) {
      this.showError('card-create.error-required');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const created = await this.cardService.createCard({
        gachaId: this.data.gachaId,
        name: this.name,
        cardType: this.cardType,
        exchangeType: this.exchangeType,
        imageFrontFile: this.imageFrontFile,
        imageBackFile: this.imageBackFile,
      });
      this.showSuccess('card-create.success');
      this.dialogRef?.close({ mode: 'create', data: created.data });
    } catch (error: any) {
      this.showError('card-create.error');
    } finally {
      this.isLoading = false;
    }
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}

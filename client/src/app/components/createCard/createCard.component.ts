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
import { ApiConfigService } from '../../service/api-config.service';

export enum CardFormMode {
  Create = 'create',
  Edit = 'edit',
}

export interface CardDialogPayload {
  id: number;
  name: string;
  cardType: string;
  exchangeType: string;
  exchangePoints: number | null;
  imageFront: string;
  imageBack: string;
}

export interface CreateCardDialogData {
  gachaId: number;
  gachaName: string;
  mode?: CardFormMode;
  card?: CardDialogPayload;
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
  exchangePoints: number | null = null;
  imageFrontFile: File | null = null;
  imageFrontPreview: SafeUrl | null = null;
  imageBackFile: File | null = null;
  imageBackPreview: SafeUrl | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  cardTypes = CARD_TYPES;
  exchangeTypes = EXCHANGE_TYPES;
  mode: CardFormMode = CardFormMode.Create;
  private editingCardId: number | null = null;

  readonly minExchangePoints = 1;
  readonly stepExchangePoints = 1;

  get isPointExchangeable(): boolean {
    return this.exchangeType === 'BOTH';
  }

  get isEditMode(): boolean {
    return this.mode === CardFormMode.Edit;
  }

  onExchangeTypeChange(): void {
    if (!this.isPointExchangeable) {
      this.exchangePoints = null;
    }
  }

  constructor(
    private cardService: CardService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private apiConfig: ApiConfigService,
    @Optional() private dialogRef: MatDialogRef<CreateCardComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CreateCardDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    if (this.data?.mode) {
      this.mode = this.data.mode;
    }

    if (this.isEditMode && this.data?.card) {
      this.prefillFromCard(this.data.card);
    }
  }

  private prefillFromCard(card: CardDialogPayload): void {
    this.editingCardId = card.id;
    this.name = card.name;
    this.cardType = card.cardType;
    this.exchangeType = card.exchangeType;
    this.exchangePoints = card.exchangePoints;
    this.imageFrontPreview = this.buildImagePreview(card.imageFront);
    this.imageBackPreview = this.buildImagePreview(card.imageBack);
  }

  private buildImagePreview(source: string | null | undefined): SafeUrl | null {
    if (!source) return null;
    let url = source;
    if (!source.startsWith('data:') && !source.startsWith('http')) {
      url = `${this.apiConfig.domain}${source}`;
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
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
    reader.onload = (event) => {
      this.imageFrontPreview = this.sanitizer.bypassSecurityTrustUrl(
        event.target?.result as string,
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
    reader.onload = (event) => {
      this.imageBackPreview = this.sanitizer.bypassSecurityTrustUrl(
        event.target?.result as string,
      );
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    const requiresNewImages = !this.isEditMode;
    if (
      !this.name ||
      !this.cardType ||
      !this.exchangeType ||
      (requiresNewImages && (!this.imageFrontFile || !this.imageBackFile))
    ) {
      this.showError('card-create.error-required');
      return;
    }

    if (
      this.isPointExchangeable &&
      (this.exchangePoints === null ||
        !Number.isInteger(this.exchangePoints) ||
        this.exchangePoints < this.minExchangePoints)
    ) {
      this.showError('card-create.error-exchange-points');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      if (this.isEditMode) {
        if (this.editingCardId === null) {
          this.showError('card-create.error');
          return;
        }
        const updated = await this.cardService.updateCard(this.editingCardId, {
          name: this.name,
          cardType: this.cardType,
          exchangeType: this.exchangeType,
          exchangePoints: this.isPointExchangeable ? this.exchangePoints : null,
          imageFrontFile: this.imageFrontFile,
          imageBackFile: this.imageBackFile,
        });
        this.showSuccess('card-create.success-edit');
        this.dialogRef?.close({ mode: 'edit', data: updated.data });
      } else {
        const created = await this.cardService.createCard({
          gachaId: this.data.gachaId,
          name: this.name,
          cardType: this.cardType,
          exchangeType: this.exchangeType,
          exchangePoints: this.isPointExchangeable ? this.exchangePoints : null,
          imageFrontFile: this.imageFrontFile!,
          imageBackFile: this.imageBackFile!,
        });
        this.showSuccess('card-create.success');
        this.dialogRef?.close({ mode: 'create', data: created.data });
      }
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

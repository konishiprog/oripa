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
import { GachaService } from '../../service/gacha.service';
import { ApiConfigService } from '../../service/api-config.service';

export enum GachaFormMode {
  Create = 'create',
  Edit = 'edit',
}

export interface GachaDialogPayload {
  id: number;
  name: string;
  headerImage: string;
  cost: number;
  isPublic: boolean;
  publishStart: string;
  publishEnd: string | null;
}

export interface CreateGachaDialogData {
  mode: GachaFormMode;
  gacha?: GachaDialogPayload;
}

const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

/**
 * Create Gacha Component
 * Manages gacha creation form with image upload
 */
@Component({
  selector: 'app-create-gacha',
  standalone: false,
  templateUrl: './createGacha.component.html',
  styleUrls: ['./createGacha.component.css'],
})
export class CreateGachaComponent implements OnInit {
  name: string = '';
  headerImageFile: File | null = null;
  headerImagePreview: SafeUrl | null = null;
  cost: number | null = null;
  publishStart: string = '';
  publishEnd: string = '';
  isPublic: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  mode: GachaFormMode = GachaFormMode.Create;
  private editingGachaId: number | null = null;

  constructor(
    private gachaService: GachaService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private apiConfig: ApiConfigService,
    @Optional() private dialogRef: MatDialogRef<CreateGachaComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: CreateGachaDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    if (this.data?.mode) {
      this.mode = this.data.mode;
    }

    if (this.isEditMode && this.data?.gacha) {
      this.prefillFromGacha(this.data.gacha);
    }
  }

  private prefillFromGacha(gacha: GachaDialogPayload): void {
    this.editingGachaId = gacha.id;
    this.name = gacha.name;
    this.cost = gacha.cost;
    this.publishStart = toDateInputValue(gacha.publishStart);
    this.publishEnd = toDateInputValue(gacha.publishEnd);
    this.isPublic = gacha.isPublic;
    if (gacha.headerImage) {
      const url = gacha.headerImage.startsWith('http')
        ? gacha.headerImage
        : `${this.apiConfig.domain}${gacha.headerImage}`;
      this.headerImagePreview = this.sanitizer.bypassSecurityTrustUrl(url);
    }
  }

  get isEditMode(): boolean {
    return this.mode === GachaFormMode.Edit;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) {
      this.headerImageFile = null;
      this.headerImagePreview = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.showError('gacha-create.error-invalid-image');
      event.target.value = '';
      return;
    }

    this.headerImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.headerImagePreview = this.sanitizer.bypassSecurityTrustUrl(
        e.target?.result as string,
      );
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    const requiresNewImage = !this.isEditMode;
    if (
      !this.name ||
      (requiresNewImage && !this.headerImageFile) ||
      this.cost === null ||
      this.cost === undefined ||
      !this.publishStart ||
      !this.publishEnd
    ) {
      this.showError('gacha-create.error-required');
      return;
    }

    if (this.cost < 0) {
      this.showError('gacha-create.error-cost');
      return;
    }

    if (new Date(this.publishStart) > new Date(this.publishEnd)) {
      this.showError('gacha-create.error-date-range');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      if (this.isEditMode) {
        if (this.editingGachaId === null) {
          this.showError('gacha-create.error');
          return;
        }
        const updated = await this.gachaService.updateGacha(
          this.editingGachaId,
          {
            name: this.name,
            cost: Number(this.cost),
            publishStart: this.publishStart,
            publishEnd: this.publishEnd,
            isPublic: this.isPublic,
            headerImageFile: this.headerImageFile,
          },
        );
        this.showSuccess('gacha-create.success-edit');
        this.dialogRef?.close({ mode: 'edit', data: updated.data });
      } else {
        const created = await this.gachaService.createGacha({
          name: this.name,
          cost: Number(this.cost),
          publishStart: this.publishStart,
          publishEnd: this.publishEnd,
          isPublic: this.isPublic,
          headerImageFile: this.headerImageFile!,
        });
        this.showSuccess('gacha-create.success');
        this.dialogRef?.close({ mode: 'create', data: created.data });
      }
    } catch (error: any) {
      if (error?.status === 409) {
        this.showError('gacha-create.error-name-exists');
      } else {
        this.showError('gacha-create.error');
      }
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

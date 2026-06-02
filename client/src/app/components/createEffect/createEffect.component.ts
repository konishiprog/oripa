import {
  Component,
  ChangeDetectorRef,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EffectService, Effect } from '../../service/effect.service';

export enum EffectFormMode {
  Create = 'create',
  Edit = 'edit',
}

export interface CreateEffectDialogData {
  mode: EffectFormMode;
  effect?: Effect;
}

@Component({
  selector: 'app-create-effect',
  standalone: false,
  templateUrl: './createEffect.component.html',
  styleUrls: [
    './createEffect.component.css',
    './createEffect.responsive.component.css',
  ],
})
export class CreateEffectComponent implements OnInit {
  name: string = '';
  url: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  mode: EffectFormMode = EffectFormMode.Create;
  private editingId: string | null = null;

  constructor(
    private effectService: EffectService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<CreateEffectComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: CreateEffectDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    if (this.data?.mode === EffectFormMode.Edit && this.data.effect) {
      this.mode = EffectFormMode.Edit;
      this.editingId = this.data.effect.id;
      this.name = this.data.effect.name;
      this.url = this.data.effect.url;
    }
  }

  get isEditMode(): boolean {
    return this.mode === EffectFormMode.Edit;
  }

  async onSubmit(): Promise<void> {
    if (!this.name || !this.name.trim()) {
      this.showError('effect-create.error-required');
      return;
    }

    if (!this.url || !this.url.trim()) {
      this.showError('effect-create.error-url-required');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.editingId) {
        const updated = await this.effectService.updateEffect(this.editingId, {
          name: this.name.trim(),
          url: this.url.trim(),
        });
        this.dialogRef?.close({ mode: 'edit', data: updated });
      } else {
        const created = await this.effectService.createEffect({
          name: this.name.trim(),
          url: this.url.trim(),
        });
        this.dialogRef?.close({ mode: 'create', data: created });
      }
    } catch (error: any) {
      if (error?.status === 409) {
        this.showError('effect-create.error-name-exists');
      } else {
        this.showError('effect-create.error');
      }
    } finally {
      this.isLoading = false;
    }
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}

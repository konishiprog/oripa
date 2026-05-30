import {
  Component,
  ChangeDetectorRef,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GenreService, Genre } from '../../service/genre.service';

export enum GenreFormMode {
  Create = 'create',
  Edit = 'edit',
}

export interface CreateGenreDialogData {
  mode: GenreFormMode;
  genre?: Genre;
}

@Component({
  selector: 'app-create-genre',
  standalone: false,
  templateUrl: './createGenre.component.html',
  styleUrls: [
    './createGenre.component.css',
    './createGenre.responsive.component.css',
  ],
})
export class CreateGenreComponent implements OnInit {
  name: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  mode: GenreFormMode = GenreFormMode.Create;
  private editingId: string | null = null;

  constructor(
    private genreService: GenreService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<CreateGenreComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: CreateGenreDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    if (this.data?.mode === GenreFormMode.Edit && this.data.genre) {
      this.mode = GenreFormMode.Edit;
      this.editingId = this.data.genre.id;
      this.name = this.data.genre.name;
    }
  }

  get isEditMode(): boolean {
    return this.mode === GenreFormMode.Edit;
  }

  async onSubmit(): Promise<void> {
    if (!this.name || !this.name.trim()) {
      this.showError('genre-create.error-required');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.editingId) {
        const updated = await this.genreService.updateGenre(this.editingId, {
          name: this.name.trim(),
        });
        this.dialogRef?.close({ mode: 'edit', data: updated });
      } else {
        const created = await this.genreService.createGenre({
          name: this.name.trim(),
        });
        this.dialogRef?.close({ mode: 'create', data: created });
      }
    } catch (error: any) {
      if (error?.status === 409) {
        this.showError('genre-create.error-name-exists');
      } else {
        this.showError('genre-create.error');
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

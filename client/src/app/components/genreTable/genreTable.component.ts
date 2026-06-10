import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GenreService, Genre } from '../../service/genre.service';
import {
  CreateGenreComponent,
  GenreFormMode,
} from '../createGenre/createGenre.component';

@Component({
  selector: 'app-genre-table',
  standalone: false,
  templateUrl: './genreTable.component.html',
  styleUrls: [
    './genreTable.component.css',
    './genreTable.responsive.component.css',
  ],
})
export class GenreTableComponent implements OnInit, OnChanges {
  @Input() genres: Genre[] = [];
  @Output() genresUpdated = new EventEmitter<void>();

  filteredGenres: Genre[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 20;
  isLoading: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private genreService: GenreService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['genres']) {
      this.applyFilters();
    }
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredGenres = this.genres.filter(
      (genre) => !query || genre.name.toLowerCase().includes(query),
    );
    this.currentPage = 1;
  }

  getDisplayedGenres(): Genre[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredGenres.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPage = newValue;
    this.currentPage = 1;
  }

  editGenre(genre: Genre): void {
    const dialogRef = this.dialog.open(CreateGenreComponent, {
      width: '480px',
      data: { mode: GenreFormMode.Edit, genre },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result?.data) {
        this.genresUpdated.emit();
        this.cdr.markForCheck();
      }
    });
  }

  async deleteGenre(genre: Genre): Promise<void> {
    const message = this.translateService.instant(
      'dashboard.delete-confirm-genre',
      { name: genre.name },
    );
    if (!confirm(message)) {
      return;
    }

    this.isLoading = true;
    try {
      await this.genreService.deleteGenre(genre.id);
      this.genresUpdated.emit();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to delete genre:', error);
      alert(this.translateService.instant('dashboard.delete-error'));
    } finally {
      this.isLoading = false;
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  CreateGachaComponent,
  GachaFormMode,
} from '../createGacha/createGacha.component';
import { GachaService } from '../../service/gacha.service';

interface Gacha {
  id: number;
  name: string;
  headerImage: string;
  consumptionType: string;
  cost: number;
  isPublic: boolean;
  publishStart: string;
  publishEnd: string | null;
  cards: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  gachas: Gacha[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 20;
  filteredGachas: Gacha[] = [];
  searchQuery: string = '';
  Math = Math;
  searchIcon: SafeHtml = '';
  resetIcon: SafeHtml = '';
  chevronLeftIcon: SafeHtml = '';
  chevronRightIcon: SafeHtml = '';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private gachaService: GachaService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadGachas();
    this.loadIcons();
  }

  async loadGachas(): Promise<void> {
    try {
      const data = await this.gachaService.getGachas();
      this.gachas = data.map((gacha: any) => ({
        id: gacha.id,
        name: gacha.name,
        headerImage: gacha.headerImage,
        consumptionType: gacha.consumptionType ?? '',
        cost: gacha.cost,
        isPublic: gacha.isPublic ?? false,
        publishStart: gacha.publishStart,
        publishEnd: gacha.publishEnd,
        cards: gacha.cardsCount ?? 0,
      }));
      this.applyFilters();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load gachas:', error);
    }
  }

  private loadIcons(): void {
    this.loadIcon('assets/icons/search.svg', (svg) => (this.searchIcon = svg));
    this.loadIcon('assets/icons/reset.svg', (svg) => (this.resetIcon = svg));
    this.loadIcon(
      'assets/icons/chevron-left.svg',
      (svg) => (this.chevronLeftIcon = svg),
    );
    this.loadIcon(
      'assets/icons/chevron-right.svg',
      (svg) => (this.chevronRightIcon = svg),
    );
  }

  private loadIcon(path: string, assign: (svg: SafeHtml) => void): void {
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (svg) => {
        assign(this.sanitizer.bypassSecurityTrustHtml(svg));
      },
      error: (error) => {
        console.error(`Failed to load icon ${path}:`, error);
      },
    });
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredGachas = query
      ? this.gachas.filter((gacha) =>
          gacha.name.toLowerCase().includes(query),
        )
      : [...this.gachas];
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  getDisplayedGachas(): Gacha[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredGachas.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredGachas.length / this.itemsPerPage);
  }

  getPageNumbers(): (number | string)[] {
    const total = this.getTotalPages();
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTotalGachaCount(): number {
    return this.gachas.length;
  }

  getPublicGachaCount(): number {
    return this.gachas.filter((gacha) => gacha.isPublic).length;
  }

  editGacha(gacha: Gacha): void {
    const dialogRef = this.dialog.open(CreateGachaComponent, {
      width: '500px',
      data: {
        mode: GachaFormMode.Edit,
        gacha: {
          id: gacha.id,
          name: gacha.name,
          headerImage: gacha.headerImage,
          cost: gacha.cost,
          isPublic: gacha.isPublic,
          publishStart: gacha.publishStart,
          publishEnd: gacha.publishEnd,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result?.data) {
        const index = this.gachas.findIndex(
          (target) => target.id === result.data.id,
        );
        if (index > -1) {
          this.gachas[index] = {
            id: result.data.id,
            name: result.data.name,
            headerImage: result.data.headerImage,
            consumptionType: result.data.consumptionType ?? '',
            cost: result.data.cost,
            isPublic: result.data.isPublic ?? false,
            publishStart: result.data.publishStart,
            publishEnd: result.data.publishEnd,
            cards: result.data.cardsCount ?? 0,
          };
          this.applyFilters();
          this.cdr.markForCheck();
        }
      }
    });
  }

  async deleteGacha(gacha: Gacha): Promise<void> {
    const message = this.translateService.instant(
      'dashboard.delete-confirm',
      { name: gacha.name },
    );
    if (!confirm(message)) {
      return;
    }

    try {
      await this.gachaService.deleteGacha(gacha.id);
      const index = this.gachas.findIndex((target) => target.id === gacha.id);
      if (index > -1) {
        this.gachas.splice(index, 1);
        this.applyFilters();
        this.cdr.markForCheck();
      }
    } catch (error) {
      console.error('Failed to delete gacha:', error);
      alert(this.translateService.instant('dashboard.delete-error'));
    }
  }

  createNewGacha(): void {
    const dialogRef = this.dialog.open(CreateGachaComponent, {
      width: '500px',
      data: { mode: GachaFormMode.Create },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'create' && result?.data) {
        setTimeout(() => {
          this.gachas.push({
            id: result.data.id,
            name: result.data.name,
            headerImage: result.data.headerImage,
            consumptionType: result.data.consumptionType ?? '',
            cost: result.data.cost,
            isPublic: result.data.isPublic ?? false,
            publishStart: result.data.publishStart,
            publishEnd: result.data.publishEnd,
            cards: result.data.cardsCount ?? 0,
          });
          this.applyFilters();
          this.cdr.markForCheck();
        });
      }
    });
  }
}

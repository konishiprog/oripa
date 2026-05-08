import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  ) {}

  ngOnInit(): void {
    this.initializeGachas();
    this.applyFilters();
    this.loadIcons();
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

  private initializeGachas(): void {
    this.gachas = [
      {
        id: 1,
        name: 'レアガチャ',
        headerImage: 'header1.jpg',
        consumptionType: 'gem',
        cost: 300,
        isPublic: true,
        publishStart: '2024-03-01',
        publishEnd: '2024-03-31',
        cards: 10,
      },
      {
        id: 2,
        name: 'スーパーレアガチャ',
        headerImage: 'header2.jpg',
        consumptionType: 'premium',
        cost: 500,
        isPublic: true,
        publishStart: '2024-03-05',
        publishEnd: '2024-04-05',
        cards: 10,
      },
      {
        id: 3,
        name: 'ウルトラレアガチャ',
        headerImage: 'header3.jpg',
        consumptionType: 'premium',
        cost: 1000,
        isPublic: false,
        publishStart: '2024-03-10',
        publishEnd: '2024-03-20',
        cards: 10,
      },
      {
        id: 4,
        name: '通常ガチャ',
        headerImage: 'header4.jpg',
        consumptionType: 'coin',
        cost: 100,
        isPublic: true,
        publishStart: '2024-01-01',
        publishEnd: null,
        cards: 10,
      },
      {
        id: 5,
        name: 'シーズンガチャ',
        headerImage: 'header5.jpg',
        consumptionType: 'gem',
        cost: 250,
        isPublic: true,
        publishStart: '2024-03-15',
        publishEnd: '2024-06-15',
        cards: 10,
      },
    ];
  }

  applyFilters(): void {
    this.filteredGachas = this.gachas.filter((gacha) => {
      const matchesSearch =
        gacha.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        gacha.id.toString().includes(this.searchQuery);
      return matchesSearch;
    });
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
    return this.gachas.filter((g) => g.isPublic).length;
  }

  editGacha(gacha: Gacha): void {
    console.log('Edit gacha:', gacha);
  }

  deleteGacha(gacha: Gacha): void {
    const index = this.gachas.findIndex((g) => g.id === gacha.id);
    if (index > -1) {
      this.gachas.splice(index, 1);
      this.applyFilters();
    }
  }

  createNewGacha(): void {
    console.log('Create new gacha');
  }
}

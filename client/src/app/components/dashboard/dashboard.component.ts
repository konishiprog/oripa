import { Component, OnInit } from '@angular/core';

interface Box {
  id: string;
  name: string;
  emoji: string;
  price: string;
  cards: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  boxes: Box[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 20;
  filteredBoxes: Box[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  seriesFilter: string = '';
  Math = Math;

  statusMap = {
    active: { label: '公開中', cls: 'badge-active' },
    inactive: { label: '非公開', cls: 'badge-inactive' },
    draft: { label: '下書き', cls: 'badge-draft' },
  };

  constructor() {}

  ngOnInit(): void {
    this.initializeBoxes();
    this.applyFilters();
  }

  private initializeBoxes(): void {
    this.boxes = [
      { id: 'BX-001', name: 'ポケモンSV シャイニートレジャーex', emoji: '✨', price: '¥500', cards: 20, stock: 142, status: 'active', date: '2024-03-15' },
      { id: 'BX-002', name: 'ポケモン 黒炎の支配者', emoji: '🔥', price: '¥700', cards: 28, stock: 31, status: 'active', date: '2024-03-12' },
      { id: 'BX-003', name: 'ポケモン 151 プレミアムBOX', emoji: '🎴', price: '¥1,500', cards: 40, stock: 5, status: 'active', date: '2024-03-10' },
      { id: 'BX-004', name: 'ポケモン スカーレット＆バイオレット', emoji: '🟣', price: '¥400', cards: 20, stock: 91, status: 'active', date: '2024-03-08' },
      { id: 'BX-005', name: 'ポケモン 白熱のアルカナ', emoji: '🌙', price: '¥600', cards: 24, stock: 0, status: 'inactive', date: '2024-03-07' },
      { id: 'BX-006', name: 'ポケモン レイジングサーフ', emoji: '🌊', price: '¥450', cards: 22, stock: 200, status: 'active', date: '2024-03-06' },
      { id: 'BX-007', name: 'ポケモン 変幻の仮面', emoji: '🎭', price: '¥800', cards: 30, stock: 74, status: 'active', date: '2024-03-05' },
      { id: 'BX-008', name: 'ポケモン ナイトワンダラー', emoji: '🦇', price: '¥600', cards: 25, stock: 0, status: 'draft', date: '2024-03-04' },
      { id: 'BX-009', name: 'ポケモン ステラミラクル', emoji: '⭐', price: '¥700', cards: 28, stock: 108, status: 'active', date: '2024-03-03' },
      { id: 'BX-010', name: 'ポケモン 楽園の頂', emoji: '🏔️', price: '¥1,200', cards: 35, stock: 47, status: 'active', date: '2024-03-02' },
    ];
  }

  applyFilters(): void {
    this.filteredBoxes = this.boxes.filter(box => {
      const matchesSearch = box.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           box.id.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.statusFilter || box.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.seriesFilter = '';
    this.applyFilters();
  }

  getDisplayedBoxes(): Box[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredBoxes.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredBoxes.length / this.itemsPerPage);
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
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
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

  getStockColor(stock: number): string {
    if (stock === 0) return '#fc8181';
    if (stock < 10) return '#f6ad55';
    return '#e2e8f0';
  }

  getTotalBoxCount(): number {
    return this.boxes.length;
  }

  getActiveBoxCount(): number {
    return this.boxes.filter(b => b.status === 'active').length;
  }

  getDraftBoxCount(): number {
    return this.boxes.filter(b => b.status === 'draft').length;
  }

  getTotalRevenue(): string {
    const total = this.boxes.reduce((sum, b) => {
      const price = parseInt(b.price.replace(/[¥,]/g, ''));
      return sum + (price * b.stock);
    }, 0);
    return `¥${(total / 1000000).toFixed(1)}M`;
  }

  editBox(box: Box): void {
    console.log('Edit box:', box);
  }

  deleteBox(box: Box): void {
    const index = this.boxes.findIndex(b => b.id === box.id);
    if (index > -1) {
      this.boxes.splice(index, 1);
      this.applyFilters();
    }
  }

  createNewBox(): void {
    console.log('Create new box');
  }
}

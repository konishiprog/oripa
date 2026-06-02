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
import { EffectService, Effect } from '../../service/effect.service';
import {
  CreateEffectComponent,
  EffectFormMode,
} from '../createEffect/createEffect.component';

@Component({
  selector: 'app-effect-table',
  standalone: false,
  templateUrl: './effectTable.component.html',
  styleUrls: [
    './effectTable.component.css',
    './effectTable.responsive.component.css',
  ],
})
export class EffectTableComponent implements OnInit, OnChanges {
  @Input() effects: Effect[] = [];
  @Output() effectsUpdated = new EventEmitter<void>();

  filteredEffects: Effect[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 20;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private effectService: EffectService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['effects']) {
      this.applyFilters();
    }
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredEffects = this.effects.filter(
      (effect) => !query || effect.name.toLowerCase().includes(query),
    );
    this.currentPage = 1;
  }

  getDisplayedEffects(): Effect[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEffects.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPage = newValue;
    this.currentPage = 1;
  }

  editEffect(effect: Effect): void {
    const dialogRef = this.dialog.open(CreateEffectComponent, {
      width: '480px',
      data: { mode: EffectFormMode.Edit, effect },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result?.data) {
        this.effectsUpdated.emit();
        this.cdr.markForCheck();
      }
    });
  }

  async deleteEffect(effect: Effect): Promise<void> {
    const message = this.translateService.instant(
      'dashboard.delete-confirm-effect',
      { name: effect.name },
    );
    if (!confirm(message)) {
      return;
    }

    try {
      await this.effectService.deleteEffect(effect.id);
      this.effectsUpdated.emit();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to delete effect:', error);
      alert(this.translateService.instant('dashboard.delete-error'));
    }
  }
}

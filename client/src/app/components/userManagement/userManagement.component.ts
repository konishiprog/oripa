import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';
import {
  UserDetailDialogComponent,
  UserDetailMode,
} from '../userDetailDialog/userDetailDialog.component';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  coin: number;
  address: string;
  phone: string;
}

interface TableHeader {
  key: string;
  labelKey: string;
}

interface TableCell {
  key: string;
  dataKey: keyof User;
  masked?: boolean;
}

const MASKED_VALUE = '*****';

const USER_TABLE_HEADERS: TableHeader[] = [
  { key: 'email', labelKey: 'user-management.table.email' },
  { key: 'password', labelKey: 'user-management.table.password' },
  { key: 'name', labelKey: 'user-management.table.name' },
  { key: 'coin', labelKey: 'user-management.table.coin' },
  { key: 'address', labelKey: 'user-management.table.address' },
  { key: 'phone', labelKey: 'user-management.table.phone' },
];

const USER_TABLE_CELLS: TableCell[] = [
  { key: 'email', dataKey: 'email' },
  { key: 'password', dataKey: 'password', masked: true },
  { key: 'name', dataKey: 'name' },
  { key: 'coin', dataKey: 'coin' },
  { key: 'address', dataKey: 'address', masked: true },
  { key: 'phone', dataKey: 'phone', masked: true },
];

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './userManagement.component.html',
  styleUrls: ['./userManagement.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;

  tableHeaders = USER_TABLE_HEADERS;
  tableCells = USER_TABLE_CELLS;
  filteredUsers: User[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 20;
  searchIcon: SafeHtml = '';
  chevronLeftIcon: SafeHtml = '';
  chevronRightIcon: SafeHtml = '';
  isComposing: boolean = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.loadIcons();
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading = true;
    try {
      const data = await this.userService.getAllUsers();
      this.users = data.map((user: any) => ({
        id: user.id,
        email: user.email ?? '',
        password: user.password ?? '',
        name: user.name ?? '',
        coin: user.coin ?? 0,
        address: user.address ?? '',
        phone: user.phone ?? '',
      }));
      this.applyFilters();
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  getTotalUserCount(): number {
    return this.users.length;
  }

  onSearchInput(): void {
    if (!this.isComposing) {
      this.applyFilters();
    }
  }

  onCompositionStart(): void {
    this.isComposing = true;
  }

  onCompositionEnd(): void {
    this.isComposing = false;
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = query
      ? this.users.filter(
          (user) =>
            user.email.toLowerCase().includes(query) ||
            user.name.toLowerCase().includes(query) ||
            user.phone.toLowerCase().includes(query),
        )
      : [...this.users];
    this.currentPage = 1;
  }

  getDisplayedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
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

  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPage = newValue;
    this.currentPage = 1;
  }

  getTextCellValue(cell: TableCell, user: User): string | number {
    return cell.masked ? MASKED_VALUE : user[cell.dataKey];
  }

  openUserDetail(user: User): void {
    this.dialog.open(UserDetailDialogComponent, {
      width: '480px',
      data: { user },
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserDetailDialogComponent, {
      width: '480px',
      data: { user, mode: UserDetailMode.Edit },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result?.data) {
        this.performUpdateUser(result.data);
      }
    });
  }

  private async performUpdateUser(updatedUser: User): Promise<void> {
    try {
      await this.userService.updateUser(updatedUser.id, {
        email: updatedUser.email,
        password: updatedUser.password,
        name: updatedUser.name,
        address: updatedUser.address,
        phone: updatedUser.phone,
        coin: updatedUser.coin,
      });
      const index = this.users.findIndex((u) => u.id === updatedUser.id);
      if (index > -1) {
        this.users[index] = updatedUser;
        this.applyFilters();
        this.cdr.markForCheck();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }

  deleteUser(user: User): void {
    const message = this.translateService.instant(
      'user-management.delete-confirm',
      { email: user.email },
    );
    if (confirm(message)) {
      this.performDeleteUser(user);
    }
  }

  private async performDeleteUser(user: User): Promise<void> {
    try {
      await this.userService.deleteUser(user.id);
      const index = this.users.findIndex((u) => u.id === user.id);
      if (index > -1) {
        this.users.splice(index, 1);
        this.applyFilters();
        this.cdr.markForCheck();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }

  getPaginationInfo(): string {
    const total = this.filteredUsers.length;
    const start =
      total === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return this.translateService.instant('dashboard.pagination.info', {
      total,
      start,
      end,
    });
  }

  private loadIcons(): void {
    this.loadIcon('assets/icons/search.svg', (svg) => (this.searchIcon = svg));
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
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(`Failed to load icon ${path}:`, error);
      },
    });
  }
}

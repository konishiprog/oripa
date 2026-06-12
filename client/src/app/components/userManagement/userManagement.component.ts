import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  firstName: string;
  lastName: string;
  nickname: string;
  coin: number;
  postalCode: string;
  prefecture: string;
  address: string;
  buildingName: string;
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
  { key: 'nickname', labelKey: 'user-management.table.nickname' },
  { key: 'lastName', labelKey: 'user-management.table.last-name' },
  { key: 'firstName', labelKey: 'user-management.table.first-name' },
  { key: 'coin', labelKey: 'user-management.table.coin' },
  { key: 'postalCode', labelKey: 'user-management.table.postal-code' },
  { key: 'prefecture', labelKey: 'user-management.table.prefecture' },
  { key: 'address', labelKey: 'user-management.table.address' },
  { key: 'buildingName', labelKey: 'user-management.table.building-name' },
  { key: 'phone', labelKey: 'user-management.table.phone' },
];

const USER_TABLE_CELLS: TableCell[] = [
  { key: 'email', dataKey: 'email' },
  { key: 'password', dataKey: 'password', masked: true },
  { key: 'nickname', dataKey: 'nickname' },
  { key: 'lastName', dataKey: 'lastName' },
  { key: 'firstName', dataKey: 'firstName' },
  { key: 'coin', dataKey: 'coin' },
  { key: 'postalCode', dataKey: 'postalCode', masked: true },
  { key: 'prefecture', dataKey: 'prefecture', masked: true },
  { key: 'address', dataKey: 'address', masked: true },
  { key: 'buildingName', dataKey: 'buildingName', masked: true },
  { key: 'phone', dataKey: 'phone', masked: true },
];

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './userManagement.component.html',
  styleUrls: [
    './userManagement.component.css',
    './userManagement.responsive.component.css',
  ],
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

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
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
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        nickname: user.nickname ?? '',
        coin: user.coin ?? 0,
        postalCode: user.postalCode ?? '',
        prefecture: user.prefecture ?? '',
        address: user.address ?? '',
        buildingName: user.buildingName ?? '',
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

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = query
      ? this.users.filter(
          (user) =>
            user.phone.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.firstName.toLowerCase().includes(query) ||
            user.nickname.toLowerCase().includes(query) ||
            user.address.toLowerCase().includes(query),
        )
      : [...this.users];
    this.currentPage = 1;
  }

  getDisplayedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
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
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        nickname: updatedUser.nickname,
        postalCode: updatedUser.postalCode,
        prefecture: updatedUser.prefecture,
        address: updatedUser.address,
        buildingName: updatedUser.buildingName,
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
}

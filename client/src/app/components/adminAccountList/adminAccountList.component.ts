import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminFormMode, CreateAdminComponent } from '../createAdmin/createAdmin.component';

export interface AdminAccount {
  id: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-admin-account-list',
  standalone: false,
  templateUrl: './adminAccountList.component.html',
  styleUrls: ['./adminAccountList.component.css'],
})
export class AdminAccountListComponent implements OnInit {
  adminAccounts: AdminAccount[] = [];
  isLoading: boolean = true;
  maxAdminAccounts: number = 100;

  constructor(
    private adminService: AdminService,
    private translateService: TranslateService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.loadAdminAccounts();
  }

  async loadAdminAccounts(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    this.isLoading = true;
    try {
      const accounts = await this.adminService.getAdminAccounts();
      this.adminAccounts = accounts.map((account: any) => ({
        id: account.id,
        email: account.email,
        password: account.password || '',
      }));
    } catch (error) {
      console.error('Failed to load admin accounts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateAdminComponent, {
      width: '500px',
      data: { mode: AdminFormMode.Create },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'create' && result?.data) {
        setTimeout(() => {
          this.adminAccounts.push(result.data);
        }, 0);
      }
    });
  }

  openEditDialog(account: AdminAccount): void {
    const dialogRef = this.dialog.open(CreateAdminComponent, {
      width: '500px',
      data: { mode: AdminFormMode.Edit, account },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.mode === 'edit' && result?.data) {
        setTimeout(() => {
          const index = this.adminAccounts.findIndex((a) => a.id === result.data.id);
          if (index !== -1) {
            this.adminAccounts[index] = result.data;
          }
        }, 0);
      }
    });
  }

  deleteAccount(account: AdminAccount): void {
    if (this.adminAccounts.length === 1) {
      const errorMessage = this.translateService.instant(
        'admin-account.page.delete-error-last-account',
      );
      alert(errorMessage);
      return;
    }

    const message = this.translateService.instant(
      'admin-account.page.delete-confirm',
      { email: account.email },
    );

    if (confirm(message)) {
      this.performDelete(account);
    }
  }

  private async performDelete(account: AdminAccount): Promise<void> {
    try {
      await this.adminService.deleteAdmin(account.id);
      setTimeout(() => {
        const index = this.adminAccounts.findIndex((a) => a.id === account.id);
        if (index !== -1) {
          this.adminAccounts.splice(index, 1);
        }
      }, 0);
    } catch (error) {
      console.error('Failed to delete admin account:', error);
    }
  }

  printAccounts(): void {
    window.print();
  }
}

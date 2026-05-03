import { Component, ChangeDetectorRef, Inject, OnInit, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../service/admin.service';

export enum AdminFormMode {
  Create = 'create',
  Edit = 'edit',
}

export interface CreateAdminDialogData {
  mode: AdminFormMode;
  account?: {
    id: string;
    email: string;
    password: string;
  };
}

/**
 * Create Admin Component
 * Manages admin user creation and editing form
 */
@Component({
  selector: 'app-create-admin',
  standalone: false,
  templateUrl: './createAdmin.component.html',
  styleUrls: ['./createAdmin.component.css'],
})
export class CreateAdminComponent implements OnInit {
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordVisible: boolean = false;
  mode: AdminFormMode = AdminFormMode.Create;
  private editingId: string | null = null;
  private readonly MIN_PASSWORD_LENGTH = 5;

  constructor(
    private adminService: AdminService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<CreateAdminComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: CreateAdminDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    if (this.data?.mode === AdminFormMode.Edit && this.data.account) {
      this.mode = AdminFormMode.Edit;
      this.editingId = this.data.account.id;
      this.email = this.data.account.email;
      this.password = this.data.account.password;
    }
  }

  get isEditMode(): boolean {
    return this.mode === AdminFormMode.Edit;
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.showError(
        this.isEditMode ? 'admin-create.error-edit' : 'admin-create.error',
      );
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('admin-create.error-email');
      return;
    }

    if (!this.isValidPassword(this.password)) {
      this.showError('admin-create.error-password');
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.editingId) {
        const updated = await this.adminService.updateAdmin(
          this.editingId,
          this.email,
          this.password,
        );
        this.showSuccess('admin-create.success-edit');
        this.dialogRef?.close({ mode: 'edit', data: updated.data });
      } else {
        const created = await this.adminService.createAdmin(
          this.email,
          this.password,
        );
        this.showSuccess('admin-create.success');
        this.email = '';
        this.password = '';
        this.dialogRef?.close({ mode: 'create', data: created.data });
      }
    } catch (error: any) {
      if (error?.status === 409) {
        this.showError('admin-create.error-email-exists');
      } else {
        this.showError(
          this.isEditMode ? 'admin-create.error-edit' : 'admin-create.error',
        );
      }
    } finally {
      this.isLoading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@');
  }

  private isValidPassword(password: string): boolean {
    return password.length >= this.MIN_PASSWORD_LENGTH;
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.cdr.detectChanges();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onClose(): void {
    this.dialogRef?.close();
  }
}

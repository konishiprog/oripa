import { Component, Inject, OnInit, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../userManagement/userManagement.component';

export enum UserDetailMode {
  View = 'view',
  Edit = 'edit',
}

export interface UserDetailDialogData {
  user: User;
  mode?: UserDetailMode;
}

@Component({
  selector: 'app-user-detail-dialog',
  standalone: false,
  templateUrl: './userDetailDialog.component.html',
  styleUrls: ['./userDetailDialog.component.css'],
})
export class UserDetailDialogComponent implements OnInit {
  readonly UserDetailMode = UserDetailMode;
  user!: User;
  mode: UserDetailMode = UserDetailMode.View;
  isLoading: boolean = false;

  constructor(
    private translateService: TranslateService,
    @Optional() private dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: UserDetailDialogData,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');
    this.user = { ...this.data.user };
    this.mode = this.data.mode || UserDetailMode.View;
  }

  get isEditMode(): boolean {
    return this.mode === UserDetailMode.Edit;
  }

  onClose(): void {
    this.dialogRef?.close();
  }

  onSubmit(): void {
    if (!this.isValidForm()) {
      return;
    }

    this.dialogRef?.close({ mode: 'edit', data: this.user });
  }

  private isValidForm(): boolean {
    if (!this.user.email || !this.user.password || !this.user.name) {
      return false;
    }
    return true;
  }
}

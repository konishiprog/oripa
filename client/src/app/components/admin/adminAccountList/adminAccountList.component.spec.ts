import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAccountListComponent, AdminAccount } from './adminAccountList.component';
import { AdminService } from '../../../service/admin.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('AdminAccountListComponent', () => {
  let component: AdminAccountListComponent;
  let fixture: ComponentFixture<AdminAccountListComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  const mockAccounts: AdminAccount[] = [
    { id: '1', email: 'admin1@example.com', password: 'password1' },
    { id: '2', email: 'admin2@example.com', password: 'password2' },
  ];

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', [
      'getAdminAccounts',
      'deleteAdmin',
    ]);
    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'setDefaultLang',
      'use',
      'instant',
    ]);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockAdminService.getAdminAccounts.and.returnValue(
      Promise.resolve(mockAccounts),
    );
    mockTranslateService.instant.and.returnValue('translated text');
    mockDialogRef.afterClosed.and.returnValue(of(null));
    mockMatDialog.open.and.returnValue(mockDialogRef);

    await TestBed.configureTestingModule({
      declarations: [AdminAccountListComponent],
      imports: [],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAccountListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty adminAccounts', () => {
    expect(component.adminAccounts).toEqual([]);
    expect(component.isLoading).toBeTrue();
    expect(component.maxAdminAccounts).toBe(100);
  });

  it('should load admin accounts on init', async () => {
    await component.loadAdminAccounts();

    expect(mockAdminService.getAdminAccounts).toHaveBeenCalled();
    expect(component.adminAccounts.length).toBe(2);
    expect(component.adminAccounts[0].email).toBe('admin1@example.com');
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to false on error', async () => {
    mockAdminService.getAdminAccounts.and.returnValue(
      Promise.reject(new Error('API Error')),
    );

    await component.loadAdminAccounts();

    expect(component.isLoading).toBeFalse();
  });

  it('should open create dialog with correct data', () => {
    component.openCreateDialog();

    expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      width: '500px',
      data: { mode: 'create' },
    });
  });

  it('should open edit dialog with correct data and account', () => {
    const account = mockAccounts[0];
    component.openEditDialog(account);

    expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      width: '500px',
      data: { mode: 'edit', account },
    });
  });

  it('should not delete account if it is the last one', () => {
    component.adminAccounts = [mockAccounts[0]];
    spyOn(window, 'alert');

    component.deleteAccount(mockAccounts[0]);

    expect(window.alert).toHaveBeenCalledWith(
      mockTranslateService.instant.calls.mostRecent().returnValue,
    );
    expect(mockAdminService.deleteAdmin).not.toHaveBeenCalled();
  });

  it('should show delete confirmation if multiple accounts exist', () => {
    component.adminAccounts = mockAccounts;
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);

    component.deleteAccount(mockAccounts[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockAdminService.deleteAdmin).not.toHaveBeenCalled();
  });

  it('should call deleteAdmin API if user confirms deletion', async () => {
    component.adminAccounts = mockAccounts.slice();
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    mockAdminService.deleteAdmin.and.returnValue(Promise.resolve({}));

    component.deleteAccount(mockAccounts[0]);

    // Wait for setTimeout in performDelete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockAdminService.deleteAdmin).toHaveBeenCalledWith(mockAccounts[0].id);
  });

  it('should remove deleted account from list', async () => {
    component.adminAccounts = mockAccounts.slice();
    spyOn(window, 'confirm').and.returnValue(true);
    mockAdminService.deleteAdmin.and.returnValue(Promise.resolve({}));

    component.deleteAccount(mockAccounts[0]);

    // Wait for setTimeout in performDelete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(component.adminAccounts.length).toBe(1);
    expect(component.adminAccounts[0].id).toBe('2');
  });
});

import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AdminAccountListComponent,
  AdminAccount,
} from './adminAccountList.component';
import { AdminFormMode, CreateAdminComponent } from '../createAdmin/createAdmin.component';
import { AdminService } from '../../service/admin.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { of } from 'rxjs';

describe('AdminAccountListComponent', () => {
  let component: AdminAccountListComponent;
  let fixture: ComponentFixture<AdminAccountListComponent>;
  let mockAdminService: any;
  let mockTranslateService: any;
  let mockMatDialog: any;
  let mockDialogRef: any;

  const mockAccounts: AdminAccount[] = [
    { id: '1', email: 'admin1@example.com', password: 'password1' },
    { id: '2', email: 'admin2@example.com', password: 'password2' },
  ];

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockAdminService = {
      getAdminAccounts: jest.fn().mockResolvedValue(mockAccounts),
      deleteAdmin: jest.fn(),
    };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn(() => 'translated text'),
    };
    mockDialogRef = {
      afterClosed: jest.fn(() => of(null)),
    };
    mockMatDialog = {
      open: jest.fn(() => mockDialogRef),
    };

    await TestBed.configureTestingModule({
      declarations: [AdminAccountListComponent, CreateAdminComponent],
      imports: [MatIconTestingModule],
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
    expect(component.isLoading).toBe(true);
    expect(component.maxAdminAccounts).toBe(100);
  });

  it('should load admin accounts on init', async () => {
    await component.loadAdminAccounts();

    expect(mockAdminService.getAdminAccounts).toHaveBeenCalled();
    expect(component.adminAccounts.length).toBe(2);
    expect(component.adminAccounts[0].email).toBe('admin1@example.com');
    expect(component.isLoading).toBe(false);
  });

  it('should set isLoading to false on error', async () => {
    mockAdminService.getAdminAccounts.mockRejectedValueOnce(
      new Error('API Error'),
    );

    await component.loadAdminAccounts();

    expect(component.isLoading).toBe(false);
  });

  it('should open create dialog with correct data', () => {
    component.openCreateDialog();

    expect(mockMatDialog.open).toHaveBeenCalledWith(CreateAdminComponent, {
      width: '500px',
      data: { mode: AdminFormMode.Create },
    });
  });

  it('should open edit dialog with correct data and account', () => {
    const account = mockAccounts[0];
    component.openEditDialog(account);

    expect(mockMatDialog.open).toHaveBeenCalledWith(CreateAdminComponent, {
      width: '500px',
      data: { mode: AdminFormMode.Edit, account },
    });
  });

  it('should not delete account if it is the last one', () => {
    component.adminAccounts = [mockAccounts[0]];
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    component.deleteAccount(mockAccounts[0]);

    expect(alertSpy).toHaveBeenCalled();
    expect(mockAdminService.deleteAdmin).not.toHaveBeenCalled();
  });

  it('should show delete confirmation if multiple accounts exist', () => {
    component.adminAccounts = mockAccounts;
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteAccount(mockAccounts[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockAdminService.deleteAdmin).not.toHaveBeenCalled();
  });

  it('should call deleteAdmin API if user confirms deletion', async () => {
    component.adminAccounts = mockAccounts.slice();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockAdminService.deleteAdmin.mockResolvedValueOnce({});

    component.deleteAccount(mockAccounts[0]);

    // Wait for setTimeout in performDelete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockAdminService.deleteAdmin).toHaveBeenCalledWith(
      mockAccounts[0].id,
    );
  });

  it('should remove deleted account from list', async () => {
    component.adminAccounts = mockAccounts.slice();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockAdminService.deleteAdmin.mockResolvedValueOnce({});

    component.deleteAccount(mockAccounts[0]);

    // Wait for setTimeout in performDelete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(component.adminAccounts.length).toBe(1);
    expect(component.adminAccounts[0].id).toBe('2');
  });
});

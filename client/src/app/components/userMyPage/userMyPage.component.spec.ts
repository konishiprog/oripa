import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { UserMyPageComponent } from './userMyPage.component';
import { UserService, User } from '../../service/user.service';
import { ConfirmUpdateDialogComponent } from './confirm-update-dialog/confirm-update-dialog.component';

describe('UserMyPageComponent', () => {
  let component: UserMyPageComponent;
  let fixture: ComponentFixture<UserMyPageComponent>;
  let mockUserService: any;
  let mockRouter: any;
  let mockHttpClient: any;
  let mockDialog: any;
  let mockTranslateService: any;
  let mockDialogRef: any;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    address: '123 Test St',
    phone: '555-0123',
    postalCode: '123-4567',
    coin: 100,
    specialPoint: 0,
  };

  beforeEach(async () => {
    mockUserService = {
      getUserId: jest.fn().mockReturnValue('test-user-id'),
      getUserById: jest.fn().mockResolvedValue(mockUser),
      updateUser: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
    mockHttpClient = {
      get: jest.fn().mockReturnValue(of('<svg></svg>')),
    };
    mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef),
    };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key),
    };

    await TestBed.configureTestingModule({
      declarations: [UserMyPageComponent, ConfirmUpdateDialogComponent],
      imports: [FormsModule, MatIconModule, TranslateModule.forRoot()],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: MatDialog, useValue: mockDialog },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMyPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', async () => {
    await component.ngOnInit();
    expect(mockUserService.getUserId).toHaveBeenCalled();
    expect(mockUserService.getUserById).toHaveBeenCalledWith('test-user-id');
    expect(component.user).toEqual(mockUser);
    expect(component.addressInput).toBe(mockUser.address);
    expect(component.emailInput).toBe(mockUser.email);
    expect(component.phoneInput).toBe(mockUser.phone);
    expect(component.postalCodeInput).toBe(mockUser.postalCode);
    expect(component.isLoading).toBe(false);
  });

  it('should navigate to gacha page if no user id', async () => {
    mockUserService.getUserId.mockReturnValue(null);
    await component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should toggle section', () => {
    component.toggleSection('address');
    expect(component.expandedSection).toBe('address');
    component.toggleSection('address');
    expect(component.expandedSection).toBeNull();
  });

  it('should clear messages when toggling section', () => {
    component.successMessage = 'Success!';
    component.errorMessage = 'Error!';
    component.toggleSection('email');
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should validate postal code input', async () => {
    component.user = mockUser;
    component.postalCodeInput = '';
    component.addressInput = '123 Test St';
    await component.saveAddressAndPostalCode();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-postal-code',
    );
    expect(component.errorMessage).toBe('my-page.error-postal-code');
  });

  it('should validate address input', async () => {
    component.user = mockUser;
    component.postalCodeInput = '123-4567';
    component.addressInput = '';
    await component.saveAddressAndPostalCode();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-required',
    );
    expect(component.errorMessage).toBe('my-page.error-required');
  });

  it('should validate email format', async () => {
    component.user = mockUser;
    component.emailInput = 'invalid-email';
    await component.saveEmail();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-email',
    );
  });

  it('should validate email is not empty', async () => {
    component.user = mockUser;
    component.emailInput = '';
    await component.saveEmail();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-required',
    );
  });

  it('should validate password fields are not empty', async () => {
    component.user = mockUser;
    component.currentPasswordInput = '';
    component.newPasswordInput = 'newPassword123';
    component.confirmPasswordInput = 'newPassword123';
    await component.savePassword();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-required',
    );
  });

  it('should validate current password matches', async () => {
    component.user = mockUser;
    component.currentPasswordInput = 'wrongPassword';
    component.newPasswordInput = 'newPassword123';
    component.confirmPasswordInput = 'newPassword123';
    await component.savePassword();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-current-password',
    );
  });

  it('should validate new password length', async () => {
    component.user = mockUser;
    component.currentPasswordInput = 'password123';
    component.newPasswordInput = 'abc';
    component.confirmPasswordInput = 'abc';
    await component.savePassword();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-password',
    );
  });

  it('should validate password confirmation matches', async () => {
    component.user = mockUser;
    component.currentPasswordInput = 'password123';
    component.newPasswordInput = 'newPassword123';
    component.confirmPasswordInput = 'differentPassword';
    await component.savePassword();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-password-mismatch',
    );
  });

  it('should validate new password is different from current', async () => {
    component.user = mockUser;
    component.currentPasswordInput = 'password123';
    component.newPasswordInput = 'password123';
    component.confirmPasswordInput = 'password123';
    await component.savePassword();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-password-same',
    );
  });

  it('should validate phone is not empty', async () => {
    component.user = mockUser;
    component.phoneInput = '';
    await component.savePhone();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-required',
    );
  });

  it('should validate phone contains only digits', async () => {
    component.user = mockUser;
    component.phoneInput = '123-456-7890';
    await component.savePhone();
    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'my-page.error-phone',
    );
  });

  it('should save phone with valid input', async () => {
    component.user = mockUser;
    component.phoneInput = '09012345678';
    mockUserService.updateUser.mockResolvedValue({
      ...mockUser,
      phone: '09012345678',
    });
    await component.savePhone();
    expect(mockDialog.open).toHaveBeenCalledWith(ConfirmUpdateDialogComponent, {
      width: '320px',
      data: { labelKey: 'my-page.phone' },
    });
  });

  it('should toggle password visibility', () => {
    expect(component.currentPasswordVisible).toBe(false);
    component.toggleCurrentPasswordVisibility();
    expect(component.currentPasswordVisible).toBe(true);
    component.toggleCurrentPasswordVisibility();
    expect(component.currentPasswordVisible).toBe(false);
  });

  it('should toggle new password visibility', () => {
    expect(component.newPasswordVisible).toBe(false);
    component.toggleNewPasswordVisibility();
    expect(component.newPasswordVisible).toBe(true);
  });

  it('should toggle confirm password visibility', () => {
    expect(component.confirmPasswordVisible).toBe(false);
    component.toggleConfirmPasswordVisibility();
    expect(component.confirmPasswordVisible).toBe(true);
  });

  it('should navigate back to gacha page', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should navigate to card history', () => {
    component.goToCardHistory();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/myPage/cardHistory']);
  });
});

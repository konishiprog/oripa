import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
} from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { LoginComponent } from './login.component';
import { LoginService } from '../../service/login.service';
import { SidebarService } from '../../service/sidebar.service';

class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'login.title': 'ログイン',
      'login.email': 'メールアドレス',
      'login.password': 'パスワード',
      'login.submit': 'ログイン',
      'login.error': 'ログインに失敗しました',
      'login.error-email': 'メールアドレスに@を含める必要があります',
      'login.error-password': 'パスワードは5文字以上にしてください',
      'login.error-invalid-credentials':
        'メールアドレスまたはパスワードが正しくありません',
      'login.success': 'ログインが完了しました',
    });
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockLoginService: any;
  let mockSidebarService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockLoginService = {
      login: jest.fn(),
    } as any;
    mockSidebarService = {
      saveAdminId: jest.fn(),
    } as any;
    mockRouter = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        FormsModule,
        MatIconModule,
        MatIconTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: LoginService, useValue: mockLoginService },
        { provide: SidebarService, useValue: mockSidebarService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default language to japanese', () => {
    const translateService = TestBed.inject(TranslateService);
    const setDefaultLangSpy = jest.spyOn(translateService, 'setDefaultLang');
    const useSpy = jest.spyOn(translateService, 'use');

    component.ngOnInit();

    expect(setDefaultLangSpy).toHaveBeenCalledWith('ja');
    expect(useSpy).toHaveBeenCalledWith('ja');
  });

  it('should show error when email is empty', async () => {
    component.email = '';
    component.password = 'password123';
    await component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
    expect(mockLoginService.login).not.toHaveBeenCalled();
  });

  it('should show error when password is empty', async () => {
    component.email = 'test@example.com';
    component.password = '';
    await component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
    expect(mockLoginService.login).not.toHaveBeenCalled();
  });

  it('should show error when email is invalid', async () => {
    component.email = 'invalid-email';
    component.password = 'password123';
    await component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
    expect(mockLoginService.login).not.toHaveBeenCalled();
  });

  it('should show error when password is too short', async () => {
    component.email = 'test@example.com';
    component.password = 'pass';
    await component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
    expect(mockLoginService.login).not.toHaveBeenCalled();
  });

  it('should successfully login with valid credentials', async () => {
    const mockResponse = {
      data: {
        id: 'admin-123',
        email: 'admin@test.com',
      },
    };
    mockLoginService.login.mockResolvedValueOnce(mockResponse);

    component.email = 'admin@test.com';
    component.password = 'password123';
    await component.onSubmit();

    expect(mockLoginService.login).toHaveBeenCalledWith(
      'admin@test.com',
      'password123',
    );
    expect(mockSidebarService.saveAdminId).toHaveBeenCalledWith('admin-123');
    expect(component.successMessage).toBeTruthy();
    expect(component.isLoading).toBeFalsy();
  });

  it('should navigate to dashboard after successful login', async () => {
    jest.useFakeTimers();
    const mockResponse = {
      data: {
        id: 'admin-123',
        email: 'admin@test.com',
      },
    };
    mockLoginService.login.mockResolvedValueOnce(mockResponse);

    component.email = 'admin@test.com';
    component.password = 'password123';
    await component.onSubmit();

    jest.advanceTimersByTime(1500);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);

    jest.useRealTimers();
  });

  it('should show 401 error message on invalid credentials', async () => {
    const error = { status: 401 };
    mockLoginService.login.mockRejectedValueOnce(error);

    component.email = 'admin@test.com';
    component.password = 'wrongpassword';
    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(component.errorMessage).toContain('メールアドレスまたはパスワード');
    expect(component.isLoading).toBeFalsy();
  });

  it('should show generic error message on other errors', async () => {
    const error = { status: 500 };
    mockLoginService.login.mockRejectedValueOnce(error);

    component.email = 'admin@test.com';
    component.password = 'password123';
    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(component.errorMessage).toContain('ログインに失敗しました');
    expect(component.isLoading).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisible).toBeFalsy();
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeTruthy();
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeFalsy();
  });

  it('should validate email correctly', () => {
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';

    expect((component as any).isValidEmail(validEmail)).toBeTruthy();
    expect((component as any).isValidEmail(invalidEmail)).toBeFalsy();
  });

  it('should validate password length', () => {
    const validPassword = 'password123';
    const shortPassword = 'pass';

    expect((component as any).isValidPassword(validPassword)).toBeTruthy();
    expect((component as any).isValidPassword(shortPassword)).toBeFalsy();
  });
});

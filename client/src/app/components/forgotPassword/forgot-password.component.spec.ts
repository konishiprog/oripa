import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let httpClientSpy: jest.Mocked<HttpClient>;
  let routerSpy: jest.Mocked<Router>;
  let translateService: TranslateService;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(async () => {
    httpClientSpy = {
      post: jest.fn(),
    } as any;

    routerSpy = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Router, useValue: routerSpy },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);

    jest.spyOn(translateService, 'setDefaultLang');
    jest.spyOn(translateService, 'use');
    jest.spyOn(translateService, 'instant').mockReturnValue('translated-message');
    jest.spyOn(changeDetectorRef, 'detectChanges');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form fields', () => {
    expect(component.email).toBe('');
    expect(component.phone).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBe(false);
  });

  it('should set default language to Japanese on init', () => {
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('ja');
    expect(translateService.use).toHaveBeenCalledWith('ja');
  });

  it('should show error when email is empty', async () => {
    component.email = '';
    component.phone = '09012345678';

    await component.onSubmit();

    expect(component.errorMessage).toBe('translated-message');
    expect(translateService.instant).toHaveBeenCalledWith('forgot-password.error-required');
  });

  it('should show error when phone is empty', async () => {
    component.email = 'test@example.com';
    component.phone = '';

    await component.onSubmit();

    expect(component.errorMessage).toBe('translated-message');
    expect(translateService.instant).toHaveBeenCalledWith('forgot-password.error-required');
  });

  it('should show error when email format is invalid', async () => {
    component.email = 'invalid-email';
    component.phone = '09012345678';

    await component.onSubmit();

    expect(component.errorMessage).toBe('translated-message');
    expect(translateService.instant).toHaveBeenCalledWith('forgot-password.error-required');
  });

  it('should clear messages before submission', async () => {
    component.successMessage = 'previous-success';
    component.errorMessage = 'previous-error';
    component.email = 'test@example.com';
    component.phone = '09012345678';

    httpClientSpy.post.mockReturnValueOnce(of({ message: 'success' }));

    await component.onSubmit();

    expect(component.successMessage).not.toBe('previous-success');
    expect(component.errorMessage).not.toBe('previous-error');
  });

  it('should submit form with valid email and phone', async () => {
    component.email = 'test@example.com';
    component.phone = '09012345678';

    httpClientSpy.post.mockReturnValueOnce(of({ message: 'success' }));

    await component.onSubmit();

    expect(httpClientSpy.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/user/forgot-password',
      {
        email: 'test@example.com',
        phone: '09012345678',
      }
    );
  });

  it('should show success message on successful submission', async () => {
    component.email = 'test@example.com';
    component.phone = '09012345678';

    httpClientSpy.post.mockReturnValueOnce(of({ message: 'success' }));

    await component.onSubmit();

    expect(translateService.instant).toHaveBeenCalledWith('forgot-password.success');
    expect(component.successMessage).toBe('translated-message');
  });

  it('should set isLoading to false after submission completes', async () => {
    component.email = 'test@example.com';
    component.phone = '09012345678';

    httpClientSpy.post.mockReturnValueOnce(of({ message: 'success' }));

    await component.onSubmit();

    expect(component.isLoading).toBe(false);
  });

  it('should navigate to userGachaPage after successful submission', async () => {
    component.email = 'test@example.com';
    component.phone = '09012345678';

    httpClientSpy.post.mockReturnValueOnce(of({ message: 'success' }));

    jest.useFakeTimers();
    await component.onSubmit();
    jest.advanceTimersByTime(3000);
    jest.useRealTimers();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should show error message for 404 error', async () => {
    component.email = 'test@example.com';
    component.phone = '09012345678';

    const error = { status: 404 };
    httpClientSpy.post.mockReturnValueOnce(throwError(() => error));

    await component.onSubmit();

    expect(translateService.instant).toHaveBeenCalledWith('forgot-password.error-not-found');
    expect(component.errorMessage).toBe('translated-message');
  });

  it('should show generic error message for non-404 errors', async () => {
    component.email = 'test@example.com';
    component.phone = '09012345678';

    const error = { status: 500 };
    httpClientSpy.post.mockReturnValueOnce(throwError(() => error));

    await component.onSubmit();

    expect(translateService.instant).toHaveBeenCalledWith('forgot-password.error');
    expect(component.errorMessage).toBe('translated-message');
  });

  it('should set isLoading to false even when error occurs', async () => {
    component.email = 'test@example.com';
    component.phone = '09012345678';

    const error = { status: 500 };
    httpClientSpy.post.mockReturnValueOnce(throwError(() => error));

    await component.onSubmit();

    expect(component.isLoading).toBe(false);
  });

  it('should navigate back to userGachaPage when onBack is called', () => {
    component.onBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should validate email with @ symbol', () => {
    expect(component['isValidEmail']('test@example.com')).toBe(true);
  });

  it('should reject email without @ symbol', () => {
    expect(component['isValidEmail']('invalid-email')).toBe(false);
  });
});

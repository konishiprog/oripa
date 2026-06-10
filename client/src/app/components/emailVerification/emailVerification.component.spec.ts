import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmailVerificationComponent } from './emailVerification.component';
import { UserService } from '../../service/user.service';
import { EventEmitter, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';

@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('EmailVerificationComponent', () => {
  let component: EmailVerificationComponent;
  let fixture: ComponentFixture<EmailVerificationComponent>;
  let userService: any;
  let router: any;
  let route: any;
  let translateService: any;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    address: 'Tokyo',
    phone: '09012345678',
    coin: 1000,
    ticket: 0,
  };

  beforeEach(async () => {
    const userServiceMock = {
      verifyEmail: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    const translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key),
      get: jest.fn((key: string) => of(key)),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      declarations: [EmailVerificationComponent, MockTranslatePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TranslateService, useValue: translateServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: new Map(),
            },
          },
        },
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    translateService = TestBed.inject(TranslateService);
    route = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(EmailVerificationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default language to ja on init', () => {
    fixture.detectChanges();

    expect(translateService.setDefaultLang).toHaveBeenCalledWith('ja');
    expect(translateService.use).toHaveBeenCalledWith('ja');
  });

  it('should show error when token is missing', () => {
    translateService.instant.mockReturnValue(
      'このリンクは無効です。もう一度登録してください。',
    );
    route.snapshot.queryParamMap = new Map();

    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'このリンクは無効です。もう一度登録してください。',
    );
  });

  it('should show success message on successful verification', (done) => {
    const token = 'test-token';
    const successMsg = 'メール認証が完了しました';

    translateService.instant.mockReturnValue(successMsg);
    userService.verifyEmail.mockResolvedValue(mockUser);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isVerifying).toBeFalsy();
      expect(component.successMessage).toBe(successMsg);
      done();
    }, 100);
  });

  it('should redirect after successful verification', (done) => {
    const token = 'test-token';
    const successMsg = 'メール認証が完了しました';

    translateService.instant.mockReturnValue(successMsg);
    userService.verifyEmail.mockResolvedValue(mockUser);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/userGachaPage']);
      done();
    }, 2100);
  });

  it('should show invalid link error on 404 response', async () => {
    const token = 'invalid-token';
    const errorMsg = 'このリンクは無効です。もう一度登録してください。';
    const error: any = new Error('Not Found');
    error.status = 404;

    translateService.instant.mockReturnValue(errorMsg);
    userService.verifyEmail.mockRejectedValue(error);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isVerifying).toBeFalsy();
    expect(component.errorMessage).toBe(errorMsg);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should show expired link error on 410 response', async () => {
    const token = 'expired-token';
    const errorMsg =
      '確認リンクの有効期限が切れました（有効期限：5分）。もう一度登録してください。';
    const error: any = new Error('Gone');
    error.status = 410;

    translateService.instant.mockReturnValue(errorMsg);
    userService.verifyEmail.mockRejectedValue(error);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isVerifying).toBeFalsy();
    expect(component.errorMessage).toBe(errorMsg);
  });

  it('should show general error on other error responses', async () => {
    const token = 'test-token';
    const errorMsg =
      'メール認証中にエラーが発生しました。もう一度登録してください。';
    const error: any = new Error('Server Error');
    error.status = 500;

    translateService.instant.mockReturnValue(errorMsg);
    userService.verifyEmail.mockRejectedValue(error);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isVerifying).toBeFalsy();
    expect(component.errorMessage).toBe(errorMsg);
  });

  it('should navigate to signup page when goToSignup is called', () => {
    component.goToSignup();

    expect(router.navigate).toHaveBeenCalledWith(['/userSignup']);
  });

  it('should call verifyEmail on init', () => {
    const verifySpy = jest.spyOn(component as any, 'verifyEmail');

    component.ngOnInit();

    expect(verifySpy).toHaveBeenCalled();

    verifySpy.mockRestore();
  });
});

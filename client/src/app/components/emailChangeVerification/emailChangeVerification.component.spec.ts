import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmailChangeVerificationComponent } from './emailChangeVerification.component';
import { UserService } from '../../service/user.service';
import {
  EventEmitter,
  NO_ERRORS_SCHEMA,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { of } from 'rxjs';

@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('EmailChangeVerificationComponent', () => {
  let component: EmailChangeVerificationComponent;
  let fixture: ComponentFixture<EmailChangeVerificationComponent>;
  let userService: any;
  let router: any;
  let route: any;
  let translateService: any;

  const mockUser = {
    id: 'test-user-id',
    email: 'newemail@example.com',
    password: 'hashed-password',
    name: 'Test User',
    address: 'Tokyo',
    phone: '09012345678',
    coin: 1000,
    specialPoint: 0,
  };

  beforeEach(async () => {
    const userServiceMock = {
      verifyEmailChange: jest.fn(),
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
      declarations: [EmailChangeVerificationComponent, MockTranslatePipe],
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

    fixture = TestBed.createComponent(EmailChangeVerificationComponent);
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
      'このリンクは無効です。もう一度メール変更をしてください。',
    );
    route.snapshot.queryParamMap = new Map();

    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'このリンクは無効です。もう一度メール変更をしてください。',
    );
  });

  it('should show success message on successful email change verification', (done) => {
    const token = 'test-token';
    const successMsg = 'メールアドレスが更新されました';

    translateService.instant.mockReturnValue(successMsg);
    userService.verifyEmailChange.mockResolvedValue(mockUser);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isVerifying).toBeFalsy();
      expect(component.successMessage).toBe(successMsg);
      done();
    }, 100);
  });

  it('should redirect to myPage after successful email change verification', (done) => {
    const token = 'test-token';
    const successMsg = 'メールアドレスが更新されました';

    translateService.instant.mockReturnValue(successMsg);
    userService.verifyEmailChange.mockResolvedValue(mockUser);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/myPage']);
      done();
    }, 2100);
  });

  it('should show invalid link error on 404 response', async () => {
    const token = 'invalid-token';
    const errorMsg = 'このリンクは無効です。もう一度メール変更をしてください。';
    const error: any = new Error('Not Found');
    error.status = 404;

    translateService.instant.mockReturnValue(errorMsg);
    userService.verifyEmailChange.mockRejectedValue(error);
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
      '確認リンクの有効期限が切れました（有効期限：5分）。もう一度メール変更をしてください。';
    const error: any = new Error('Gone');
    error.status = 410;

    translateService.instant.mockReturnValue(errorMsg);
    userService.verifyEmailChange.mockRejectedValue(error);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isVerifying).toBeFalsy();
    expect(component.errorMessage).toBe(errorMsg);
  });

  it('should show general error on other error responses', async () => {
    const token = 'test-token';
    const errorMsg =
      'メール変更中にエラーが発生しました。もう一度メール変更をしてください。';
    const error: any = new Error('Server Error');
    error.status = 500;

    translateService.instant.mockReturnValue(errorMsg);
    userService.verifyEmailChange.mockRejectedValue(error);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isVerifying).toBeFalsy();
    expect(component.errorMessage).toBe(errorMsg);
  });

  it('should navigate to myPage when goToMyPage is called', () => {
    component.goToMyPage();

    expect(router.navigate).toHaveBeenCalledWith(['/myPage']);
  });

  it('should call verifyEmailChange on init', () => {
    const verifySpy = jest.spyOn(component as any, 'verifyEmailChange');

    component.ngOnInit();

    expect(verifySpy).toHaveBeenCalled();

    verifySpy.mockRestore();
  });

  it('should call userService.verifyEmailChange with correct token', async () => {
    const token = 'test-token-123';

    translateService.instant.mockReturnValue('メールアドレスが更新されました');
    userService.verifyEmailChange.mockResolvedValue(mockUser);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(userService.verifyEmailChange).toHaveBeenCalledWith(token);
  });

  it('should update isVerifying flag to false after verification attempt', async () => {
    const token = 'test-token';

    translateService.instant.mockReturnValue('メールアドレスが更新されました');
    userService.verifyEmailChange.mockResolvedValue(mockUser);
    route.snapshot.queryParamMap = new Map([['token', token]]);

    expect(component.isVerifying).toBeTruthy();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isVerifying).toBeFalsy();
  });
});

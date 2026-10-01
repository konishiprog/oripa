import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserSignupSelectComponent } from './userSignupSelect.component';

describe('UserSignupSelectComponent', () => {
  let component: UserSignupSelectComponent;
  let fixture: ComponentFixture<UserSignupSelectComponent>;
  let mockRouter: any;
  let mockTranslateService: any;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key),
    };

    await TestBed.configureTestingModule({
      declarations: [UserSignupSelectComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSignupSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to email signup when email method is selected', () => {
    const emailMethod = component.signupMethods.find(
      (signupMethod) => signupMethod.type === 'EMAIL',
    )!;

    component.selectMethod(emailMethod);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userSignup/email']);
  });

  it('should show coming soon message for social signup methods', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const lineMethod = component.signupMethods.find(
      (signupMethod) => signupMethod.type === 'LINE',
    )!;

    component.selectMethod(lineMethod);

    expect(alertSpy).toHaveBeenCalledWith('user-signup-select.coming-soon');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should navigate to login method selection', () => {
    component.goToLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userLogin']);
  });

  it('should navigate to terms and privacy pages', () => {
    component.navigateToTerms();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/terms']);

    component.navigateToPrivacy();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/privacy']);
  });
});

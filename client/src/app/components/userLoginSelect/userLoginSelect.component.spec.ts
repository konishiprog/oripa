import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UserLoginSelectComponent } from './userLoginSelect.component';
import { UserService } from '../../service/user.service';

describe('UserLoginSelectComponent', () => {
  let component: UserLoginSelectComponent;
  let fixture: ComponentFixture<UserLoginSelectComponent>;
  let mockRouter: any;
  let mockDialog: any;
  let mockUserService: any;
  let mockTranslateService: any;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockDialog = { open: jest.fn() };
    mockUserService = { saveCoin: jest.fn(), saveTicket: jest.fn() };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key),
    };

    await TestBed.configureTestingModule({
      declarations: [UserLoginSelectComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: UserService, useValue: mockUserService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLoginSelectComponent);
    component = fixture.componentInstance;
  });

  const findMethod = (type: string) =>
    component.loginMethods.find((loginMethod) => loginMethod.type === type)!;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save coin and ticket and navigate after email login', () => {
    mockDialog.open.mockReturnValue({
      afterClosed: () => of({ success: true, data: { coin: 100, ticket: 2 } }),
    });

    component.selectMethod(findMethod('EMAIL'));

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockUserService.saveCoin).toHaveBeenCalledWith(100);
    expect(mockUserService.saveTicket).toHaveBeenCalledWith(2);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should not navigate when login dialog is cancelled', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    component.selectMethod(findMethod('EMAIL'));

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should show coming soon message for social login methods', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    component.selectMethod(findMethod('GOOGLE'));

    expect(alertSpy).toHaveBeenCalledWith('user-login-select.coming-soon');
    expect(mockDialog.open).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

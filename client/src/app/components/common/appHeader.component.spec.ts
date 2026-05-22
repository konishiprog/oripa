import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AppHeaderComponent } from './appHeader.component';
import { UserService } from '../../service/user.service';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let mockUserService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockTranslateService: any;

  beforeEach(async () => {
    mockUserService = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      getCoin: jest.fn().mockReturnValue(null),
      getSpecialPoint: jest.fn().mockReturnValue(null),
      saveCoin: jest.fn(),
      saveSpecialPoint: jest.fn(),
      clearUserId: jest.fn(),
      clearCoin: jest.fn(),
      clearSpecialPoint: jest.fn(),
    };
    const routerEventsSubject = new Subject();
    mockRouter = {
      navigate: jest.fn(),
      url: '/userGachaPage',
      events: routerEventsSubject.asObservable(),
    };
    mockDialog = {
      open: jest.fn(),
    };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key),
    };

    await TestBed.configureTestingModule({
      declarations: [AppHeaderComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with logged in state', () => {
    mockUserService.isLoggedIn.mockReturnValue(true);
    component.ngOnInit();
    expect(component.isLoggedIn).toBe(true);
  });

  it('should navigate to my page', () => {
    component.goToMyPage();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/myPage']);
  });

  it('should logout and navigate to gacha page', () => {
    component.logout();
    expect(mockUserService.clearUserId).toHaveBeenCalled();
    expect(mockUserService.clearCoin).toHaveBeenCalled();
    expect(mockUserService.clearSpecialPoint).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should navigate to coin charge page when charge button is clicked', () => {
    component.goToCharge();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/coinCharge']);
  });

  it('should load coin and special point on init', () => {
    mockUserService.getCoin.mockReturnValue(1000);
    mockUserService.getSpecialPoint.mockReturnValue(100);
    component.ngOnInit();
    expect(component.userCoin).toBe(1000);
    expect(component.userSpecialPoint).toBe(100);
  });
});

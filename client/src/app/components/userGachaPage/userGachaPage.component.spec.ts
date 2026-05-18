import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { UserGachaPageComponent } from './userGachaPage.component';
import { GachaService } from '../../service/gacha.service';
import { UserService } from '../../service/user.service';

describe('UserGachaPageComponent', () => {
  let component: UserGachaPageComponent;
  let fixture: ComponentFixture<UserGachaPageComponent>;
  let gachaService: jest.Mocked<GachaService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const gachaSpy = {
      getGachas: jest.fn<Promise<any[]>, []>(),
    };
    const userSpy = {
      isLoggedIn: jest.fn<boolean, []>(),
      clearUserId: jest.fn<void, []>(),
    };

    await TestBed.configureTestingModule({
      declarations: [UserGachaPageComponent],
      imports: [TranslateModule.forRoot(), MatDialogModule],
      providers: [
        { provide: GachaService, useValue: gachaSpy },
        { provide: UserService, useValue: userSpy },
      ],
    }).compileComponents();

    gachaService = TestBed.inject(GachaService) as jest.Mocked<GachaService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;

    fixture = TestBed.createComponent(UserGachaPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading).toBe(true);
    expect(component.gachas.length).toBe(0);
  });

  it('should load gachas on init', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Test Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.gachas.length).toBe(1);
    expect(component.isLoading).toBe(false);
  });

  it('should filter only public gachas', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Public Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
      {
        id: 2,
        name: 'Private Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        isPublic: false,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.gachas.length).toBe(1);
    expect(component.gachas[0].name).toBe('Public Gacha');
  });

  it('should check login status on init', async () => {
    gachaService.getGachas.mockResolvedValue([]);
    userService.isLoggedIn.mockReturnValue(true);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isLoggedIn).toBe(true);
  });

  it('should logout user', () => {
    component.isLoggedIn = true;
    component.logout();

    expect(userService.clearUserId).toHaveBeenCalled();
    expect(component.isLoggedIn).toBe(false);
  });

  it('should format price correctly', () => {
    const formattedPrice = component.formatPrice(100000);
    expect(formattedPrice).toBe('¥100,000');
  });
});

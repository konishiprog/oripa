import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
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
      clearCoin: jest.fn<void, []>(),
    };

    await TestBed.configureTestingModule({
      declarations: [UserGachaPageComponent],
      imports: [TranslateModule.forRoot(), MatDialogModule],
      providers: [
        { provide: GachaService, useValue: gachaSpy },
        { provide: UserService, useValue: userSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    gachaService = TestBed.inject(GachaService) as jest.Mocked<GachaService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;

    fixture = TestBed.createComponent(UserGachaPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state and new tab', () => {
    expect(component.isLoading).toBe(true);
    expect(component.gachas.length).toBe(0);
    expect(component.activeTab).toBe('new');
  });

  it('should load gachas on init', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Test Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        remainingCount: 5,
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
    expect(component.gachas[0].remainingCount).toBe(5);
    expect(component.isLoading).toBe(false);
  });

  it('should default remainingCount to 0 when API does not return it', async () => {
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

    expect(component.gachas[0].remainingCount).toBe(0);
  });

  it('should filter only public gachas', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Public Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        remainingCount: 3,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
      {
        id: 2,
        name: 'Private Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        remainingCount: 3,
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

  it('should sort gachas by id descending (newest first)', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Old',
        headerImage: '',
        cost: 100,
        remainingCount: 1,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
      {
        id: 3,
        name: 'Newest',
        headerImage: '',
        cost: 100,
        remainingCount: 1,
        isPublic: true,
        publishStart: '2026-01-03',
        publishEnd: null,
      },
      {
        id: 2,
        name: 'Mid',
        headerImage: '',
        cost: 100,
        remainingCount: 1,
        isPublic: true,
        publishStart: '2026-01-02',
        publishEnd: null,
      },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.gachas.map((gacha) => gacha.id)).toEqual([3, 2, 1]);
  });

  it('should handle error when loading gachas fails', async () => {
    gachaService.getGachas.mockRejectedValue(new Error('API Error'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isLoading).toBe(false);
    expect(component.gachas.length).toBe(0);
  });

  it('should switch active tab', () => {
    component.selectTab('popular');
    expect(component.activeTab).toBe('popular');

    component.selectTab('new');
    expect(component.activeTab).toBe('new');
  });

  it('selectTab should switch active tab', () => {
    expect(component.activeTab).toBe('new');
    component.selectTab('popular');
    expect(component.activeTab).toBe('popular');
    component.selectTab('new');
    expect(component.activeTab).toBe('new');
  });
});

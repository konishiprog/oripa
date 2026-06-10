import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GachaWinnersDialogComponent } from './gachaWinnersDialog.component';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';

describe('GachaWinnersDialogComponent', () => {
  let component: GachaWinnersDialogComponent;
  let fixture: ComponentFixture<GachaWinnersDialogComponent>;
  let cardService: CardService;
  let userService: UserService;
  let httpMock: HttpTestingController;
  let dialogRef: MatDialogRef<GachaWinnersDialogComponent>;

  const mockDialogData = {
    gachaId: 'test-gacha-id',
    gachaName: 'Test Gacha',
  };

  const mockUsers = [
    {
      id: 'user1',
      nickname: 'Player1',
      name: 'Player One',
      email: '',
      password: '',
      address: '',
      phone: '',
      postalCode: '',
      coin: 0,
      ticket: 0,
    },
    {
      id: 'user2',
      nickname: '',
      name: 'Player Two',
      email: '',
      password: '',
      address: '',
      phone: '',
      postalCode: '',
      coin: 0,
      ticket: 0,
    },
    {
      id: 'user3',
      nickname: 'Player3',
      name: 'Player Three',
      email: '',
      password: '',
      address: '',
      phone: '',
      postalCode: '',
      coin: 0,
      ticket: 0,
    },
  ];

  const mockCards = [
    { id: 'card1', cardType: 'SSR', userId: 'user1', gachaId: 'test-gacha-id' },
    { id: 'card2', cardType: 'SSR', userId: 'user3', gachaId: 'test-gacha-id' },
    { id: 'card3', cardType: 'SR', userId: 'user2', gachaId: 'test-gacha-id' },
    { id: 'card4', cardType: 'R', userId: 'user1', gachaId: 'test-gacha-id' },
    { id: 'card5', cardType: 'SSR', userId: null, gachaId: 'test-gacha-id' },
  ];

  beforeEach(async () => {
    const cardServiceMock = {
      getCardsByGachaId: jest.fn().mockResolvedValue([]),
    };

    const userServiceMock = {
      getAllUsers: jest.fn().mockResolvedValue([]),
    };

    const dialogRefMock = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [GachaWinnersDialogComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: CardService, useValue: cardServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        TranslateService,
      ],
    }).compileComponents();

    cardService = TestBed.inject(CardService);
    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    dialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(GachaWinnersDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
  });

  it('should create', async () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should load avatar icon on init', async () => {
    (cardService.getCardsByGachaId as jest.Mock).mockResolvedValue([]);
    (userService.getAllUsers as jest.Mock).mockResolvedValue([]);

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    expect(req.request.method).toBe('GET');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    expect(component.avatarIcon).toBeTruthy();
  });

  it('should separate SSR and SR winners correctly', async () => {
    jest
      .spyOn(cardService, 'getCardsByGachaId')
      .mockReturnValue(Promise.resolve(mockCards));
    jest
      .spyOn(userService, 'getAllUsers')
      .mockReturnValue(Promise.resolve(mockUsers));

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.ssrWinners.length).toBe(2);
    expect(component.ssrWinners[0].nickname).toBe('Player1');
    expect(component.ssrWinners[1].nickname).toBe('Player3');

    expect(component.srWinners.length).toBe(1);
    expect(component.srWinners[0].nickname).toBe('Player Two');
  });

  it('should use name when nickname is empty', async () => {
    jest.spyOn(cardService, 'getCardsByGachaId').mockReturnValue(
      Promise.resolve([
        {
          id: 'card1',
          cardType: 'SR',
          userId: 'user2',
          gachaId: 'test-gacha-id',
        },
      ]),
    );
    jest
      .spyOn(userService, 'getAllUsers')
      .mockReturnValue(Promise.resolve(mockUsers));

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.srWinners[0].nickname).toBe('Player Two');
  });

  it('should exclude cards without userId', async () => {
    jest.spyOn(cardService, 'getCardsByGachaId').mockReturnValue(
      Promise.resolve([
        {
          id: 'card1',
          cardType: 'SSR',
          userId: null,
          gachaId: 'test-gacha-id',
        },
        {
          id: 'card2',
          cardType: 'SSR',
          userId: 'user1',
          gachaId: 'test-gacha-id',
        },
      ]),
    );
    jest
      .spyOn(userService, 'getAllUsers')
      .mockReturnValue(Promise.resolve(mockUsers));

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.ssrWinners.length).toBe(1);
    expect(component.ssrWinners[0].nickname).toBe('Player1');
  });

  it('should exclude non-SSR/SR cards', async () => {
    jest.spyOn(cardService, 'getCardsByGachaId').mockReturnValue(
      Promise.resolve([
        {
          id: 'card1',
          cardType: 'R',
          userId: 'user1',
          gachaId: 'test-gacha-id',
        },
        {
          id: 'card2',
          cardType: 'N',
          userId: 'user2',
          gachaId: 'test-gacha-id',
        },
        {
          id: 'card3',
          cardType: 'SSR',
          userId: 'user3',
          gachaId: 'test-gacha-id',
        },
      ]),
    );
    jest
      .spyOn(userService, 'getAllUsers')
      .mockReturnValue(Promise.resolve(mockUsers));

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.ssrWinners.length).toBe(1);
    expect(component.srWinners.length).toBe(0);
  });

  it('should set isLoading to false after loading', async () => {
    jest
      .spyOn(cardService, 'getCardsByGachaId')
      .mockReturnValue(Promise.resolve([]));
    jest.spyOn(userService, 'getAllUsers').mockReturnValue(Promise.resolve([]));

    expect(component.isLoading).toBe(true);

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
  });

  it('should close dialog when onClose is called', () => {
    jest
      .spyOn(cardService, 'getCardsByGachaId')
      .mockReturnValue(Promise.resolve([]));
    jest.spyOn(userService, 'getAllUsers').mockReturnValue(Promise.resolve([]));

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    component.onClose();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should handle error when loading cards fails', async () => {
    jest
      .spyOn(cardService, 'getCardsByGachaId')
      .mockReturnValue(Promise.reject(new Error('Load failed')));
    jest.spyOn(userService, 'getAllUsers').mockReturnValue(Promise.resolve([]));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should handle empty winners list', async () => {
    jest
      .spyOn(cardService, 'getCardsByGachaId')
      .mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(userService, 'getAllUsers')
      .mockReturnValue(Promise.resolve(mockUsers));

    fixture.detectChanges();

    const req = httpMock.expectOne('assets/icons/user-profile.svg');
    req.flush('<svg>avatar</svg>');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.ssrWinners.length).toBe(0);
    expect(component.srWinners.length).toBe(0);
  });
});

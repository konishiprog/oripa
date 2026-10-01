import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { BackNavigationService } from './back-navigation.service';

describe('BackNavigationService', () => {
  let service: BackNavigationService;
  let mockRouter: any;
  let mockLocation: any;

  beforeEach(() => {
    mockRouter = { navigate: jest.fn(), lastSuccessfulNavigation: null };
    mockLocation = { back: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        BackNavigationService,
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
      ],
    });
    service = TestBed.inject(BackNavigationService);
  });

  it('should go back when there is a previous navigation', () => {
    mockRouter.lastSuccessfulNavigation = { previousNavigation: {} };

    service.back();

    expect(mockLocation.back).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to gacha page when there is no previous navigation', () => {
    service.back();

    expect(mockLocation.back).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });
});

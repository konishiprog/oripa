import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ContactPageComponent } from './contactPage.component';
import { UserService } from '../../service/user.service';
import { ContactService } from '../../service/contact.service';
import { TranslateService } from '@ngx-translate/core';

describe('ContactPageComponent', () => {
  let component: ContactPageComponent;
  let userService: any;
  let contactService: any;
  let router: any;
  let translateService: any;

  beforeEach(async () => {
    const userServiceMock = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getUserId: jest.fn().mockReturnValue('user-id-123'),
    };

    const contactServiceMock = {
      sendInquiry: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    const translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key),
    };

    await TestBed.configureTestingModule({
      declarations: [ContactPageComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ContactService, useValue: contactServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    })
      .overrideComponent(ContactPageComponent, {
        set: {
          template: `<div></div>`,
        },
      })
      .compileComponents();

    userService = TestBed.inject(UserService);
    contactService = TestBed.inject(ContactService);
    router = TestBed.inject(Router);
    translateService = TestBed.inject(TranslateService);

    const fixture = TestBed.createComponent(ContactPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to gacha page if not logged in', () => {
    userService.isLoggedIn.mockReturnValue(false);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should initialize with empty form fields', () => {
    expect(component.title).toBe('');
    expect(component.content).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBe(false);
  });

  it('should show error if title is empty', async () => {
    component.title = '';
    component.content = 'Some content';
    await component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
    expect(contactService.sendInquiry).not.toHaveBeenCalled();
  });

  it('should show error if content is empty', async () => {
    component.title = 'Some title';
    component.content = '';
    await component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
    expect(contactService.sendInquiry).not.toHaveBeenCalled();
  });

  it('should show error if both title and content are empty', async () => {
    component.title = '';
    component.content = '';
    await component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
    expect(contactService.sendInquiry).not.toHaveBeenCalled();
  });

  it('should handle successful inquiry submission', async () => {
    component.title = 'Test Title';
    component.content = 'Test content';
    contactService.sendInquiry.mockResolvedValue({ message: 'Success' });

    await component.onSubmit();

    expect(contactService.sendInquiry).toHaveBeenCalledWith(
      'user-id-123',
      'Test Title',
      'Test content',
    );
    expect(component.successMessage).toBeTruthy();
    expect(component.title).toBe('');
    expect(component.content).toBe('');
  });

  it('should trim whitespace from title and content', async () => {
    component.title = '  Test Title  ';
    component.content = '  Test content  ';
    contactService.sendInquiry.mockResolvedValue({ message: 'Success' });

    await component.onSubmit();

    expect(contactService.sendInquiry).toHaveBeenCalledWith(
      'user-id-123',
      'Test Title',
      'Test content',
    );
  });

  it('should handle submission error', async () => {
    component.title = 'Test Title';
    component.content = 'Test content';
    contactService.sendInquiry.mockRejectedValue(new Error('Network error'));

    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(component.title).toBe('Test Title');
    expect(component.content).toBe('Test content');
  });

  it('should redirect to gacha page on goBack', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should set isLoading to true during submission', async () => {
    component.title = 'Test Title';
    component.content = 'Test content';
    let isLoadingDuringCall = false;

    contactService.sendInquiry.mockImplementation(() => {
      isLoadingDuringCall = component.isLoading;
      return Promise.resolve({ message: 'Success' });
    });

    await component.onSubmit();

    expect(isLoadingDuringCall).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('should clear previous messages on new submission', async () => {
    component.successMessage = 'Previous success';
    component.errorMessage = 'Previous error';
    component.title = 'Test Title';
    component.content = 'Test content';
    contactService.sendInquiry.mockResolvedValue({ message: 'Success' });

    await component.onSubmit();

    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBeTruthy();
  });

  it('should not redirect when user is not found during submission', async () => {
    component.title = 'Test Title';
    component.content = 'Test content';
    userService.getUserId.mockReturnValue(null);

    await component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserSignupComponent } from './userSignup.component';
import { UserService } from '../../service/user.service';

describe('UserSignupComponent', () => {
  let component: UserSignupComponent;
  let fixture: ComponentFixture<UserSignupComponent>;
  let userService: any;
  let router: any;

  beforeEach(async () => {
    const userSpy = {
      createUser: jest.fn<Promise<any>, [any]>(),
    };
    const routerSpy = {
      navigate: jest.fn<Promise<boolean>, [any[]]>(),
    };

    await TestBed.configureTestingModule({
      declarations: [UserSignupComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService) as any;
    router = TestBed.inject(Router) as any;

    fixture = TestBed.createComponent(UserSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.firstName).toBe('');
    expect(component.lastName).toBe('');
    expect(component.address).toBe('');
    expect(component.phone).toBe('');
    expect(component.postalCode).toBe('');
    expect(component.prefecture).toBe('');
    expect(component.isLoading).toBe(false);
  });

  it('should navigate back', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should toggle password visibility', () => {
    component.passwordVisible = false;
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBe(true);

    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBe(false);
  });

  it('should validate required fields', async () => {
    component.email = '';
    component.password = '';
    component.firstName = '';
    component.lastName = '';
    component.address = '';
    component.phone = '';
    component.postalCode = '';
    component.prefecture = '';

    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(userService.createUser).not.toHaveBeenCalled();
  });

  it('should handle successful signup', async () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    component.firstName = 'Test';
    component.lastName = 'User';
    component.nickname = 'Tester';
    component.postalCode = '123-4567';
    component.prefecture = 'Tokyo';
    component.address = 'Test Address';
    component.buildingName = 'Tower A';
    component.phone = '09012345678';
    userService.createUser.mockResolvedValue({});

    await component.onSubmit();

    expect(userService.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      nickname: 'Tester',
      postalCode: '123-4567',
      prefecture: 'Tokyo',
      address: 'Test Address',
      buildingName: 'Tower A',
      phone: '09012345678',
    });
  });

  it('should validate email format', async () => {
    component.email = 'invalid-email';
    component.password = 'password123';
    component.firstName = 'Test';
    component.lastName = 'User';
    component.address = 'Test Address';
    component.phone = '09012345678';
    component.postalCode = '123-4567';
    component.prefecture = 'Tokyo';

    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(userService.createUser).not.toHaveBeenCalled();
  });

  it('should validate password length', async () => {
    component.email = 'test@example.com';
    component.password = '123';
    component.firstName = 'Test';
    component.lastName = 'User';
    component.address = 'Test Address';
    component.phone = '09012345678';
    component.postalCode = '123-4567';
    component.prefecture = 'Tokyo';

    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(userService.createUser).not.toHaveBeenCalled();
  });

  it('should validate phone format', async () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    component.firstName = 'Test';
    component.lastName = 'User';
    component.address = 'Test Address';
    component.phone = 'not-a-number';
    component.postalCode = '123-4567';
    component.prefecture = 'Tokyo';

    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(userService.createUser).not.toHaveBeenCalled();
  });
});

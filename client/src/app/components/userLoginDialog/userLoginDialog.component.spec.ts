import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserLoginDialogComponent } from './userLoginDialog.component';
import { UserService } from '../../service/user.service';

describe('UserLoginDialogComponent', () => {
  let component: UserLoginDialogComponent;
  let fixture: ComponentFixture<UserLoginDialogComponent>;
  let userService: any;
  let dialogRef: any;

  beforeEach(async () => {
    const userSpy = {
      login: jest.fn<Promise<any>, [string, string]>(),
      saveUserId: jest.fn<void, [number]>(),
    };
    const dialogSpy = {
      close: jest.fn<void, [any]>(),
    };

    await TestBed.configureTestingModule({
      declarations: [UserLoginDialogComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: MatDialogRef, useValue: dialogSpy },
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService) as any;
    dialogRef = TestBed.inject(MatDialogRef) as any;

    fixture = TestBed.createComponent(UserLoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.identifier).toBe('');
    expect(component.password).toBe('');
    expect(component.isLoading).toBe(false);
  });

  it('should close dialog', () => {
    component.onClose();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    component.passwordVisible = false;
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBe(true);

    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBe(false);
  });

  it('should validate required fields', async () => {
    component.identifier = '';
    component.password = '';

    await component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(userService.login).not.toHaveBeenCalled();
  });

  it('should handle successful login', async () => {
    component.identifier = 'test@example.com';
    component.password = 'password123';
    const mockResponse = { data: { id: 1, email: 'test@example.com' } };
    userService.login.mockResolvedValue(mockResponse);

    await component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(userService.saveUserId).toHaveBeenCalledWith(1);
  });
});

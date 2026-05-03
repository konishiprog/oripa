import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateAdminComponent } from './createAdmin.component';
import { AdminService } from '../../service/admin.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

describe('CreateAdminComponent', () => {
  let component: CreateAdminComponent;
  let fixture: ComponentFixture<CreateAdminComponent>;
  let adminService: AdminService;

  beforeEach(async () => {
    const httpClientSpy = {
      post: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [CreateAdminComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, FormsModule],
      providers: [AdminService, { provide: HttpClient, useValue: httpClientSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdminComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should show error when email or password is empty', async () => {
    component.email = '';
    component.password = '';
    await component.onSubmit();
    expect(component.errorMessage).not.toBe('');
  });

  it('should call adminService.createAdmin with email and password on submit', async () => {
    jest.spyOn(adminService, 'createAdmin').mockResolvedValueOnce(
      { message: 'success' }
    );

    component.email = 'test@example.com';
    component.password = 'password123';

    await component.onSubmit();

    expect(adminService.createAdmin).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
  });
});

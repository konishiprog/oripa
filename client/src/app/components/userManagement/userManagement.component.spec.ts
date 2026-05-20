import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { UserManagementComponent, User } from './userManagement.component';
import { UserService } from '../../service/user.service';
import { UserDetailDialogComponent } from '../userDetailDialog/userDetailDialog.component';
import { of } from 'rxjs';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userService: any;
  let translateService: TranslateService;
  let matDialog: MatDialog;

  const mockUsers: User[] = [
    {
      id: 'user-uuid-1',
      email: 'user1@example.com',
      password: 'password123',
      name: 'User One',
      coin: 1000,
      address: '123 Main St',
      phone: '09012345678',
    },
    {
      id: 'user-uuid-2',
      email: 'user2@example.com',
      password: 'password456',
      name: 'User Two',
      coin: 2000,
      address: '456 Oak Ave',
      phone: '09087654321',
    },
    {
      id: 'user-uuid-3',
      email: 'user3@example.com',
      password: 'password789',
      name: 'User Three',
      coin: 3000,
      address: '789 Pine Rd',
      phone: '09011223344',
    },
  ];

  beforeEach(async () => {
    const userServiceMock = {
      getAllUsers: jest.fn().mockResolvedValue(mockUsers),
      updateUser: jest.fn().mockResolvedValue(mockUsers[0]),
      deleteUser: jest.fn().mockResolvedValue({}),
    };

    await TestBed.configureTestingModule({
      declarations: [UserManagementComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
        FormsModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        TranslateService,
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService);
    translateService = TestBed.inject(TranslateService);
    matDialog = TestBed.inject(MatDialog);

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadUsers', () => {
    it('should load users from service', async () => {
      await component.loadUsers();

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(component.users.length).toBe(3);
      expect(component.users[0].email).toBe('user1@example.com');
    });

    it('should set isLoading to false after loading', async () => {
      component.isLoading = true;
      await component.loadUsers();

      expect(component.isLoading).toBe(false);
    });

    it('should apply filters after loading users', async () => {
      jest.spyOn(component, 'applyFilters');
      await component.loadUsers();

      expect(component.applyFilters).toHaveBeenCalled();
    });
  });

  describe('getTotalUserCount', () => {
    it('should return the total number of users', async () => {
      await component.loadUsers();

      expect(component.getTotalUserCount()).toBe(3);
    });
  });

  describe('applyFilters', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should filter users by email', () => {
      component.searchQuery = 'user1@example.com';
      component.applyFilters();

      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].email).toBe('user1@example.com');
    });

    it('should filter users by name', () => {
      component.searchQuery = 'User Two';
      component.applyFilters();

      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].name).toBe('User Two');
    });

    it('should filter users by phone', () => {
      component.searchQuery = '09012345678';
      component.applyFilters();

      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].phone).toBe('09012345678');
    });

    it('should reset to page 1 after filtering', () => {
      component.currentPage = 3;
      component.searchQuery = 'user';
      component.applyFilters();

      expect(component.currentPage).toBe(1);
    });

    it('should return all users when search query is empty', () => {
      component.searchQuery = '';
      component.applyFilters();

      expect(component.filteredUsers.length).toBe(3);
    });
  });

  describe('onSearchInput', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should apply filters when not composing', () => {
      jest.spyOn(component, 'applyFilters');
      component.isComposing = false;

      component.onSearchInput();

      expect(component.applyFilters).toHaveBeenCalled();
    });

    it('should not apply filters when composing', () => {
      jest.spyOn(component, 'applyFilters');
      component.isComposing = true;

      component.onSearchInput();

      expect(component.applyFilters).not.toHaveBeenCalled();
    });
  });

  describe('pagination', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should get displayed users for current page', () => {
      component.currentPage = 1;
      component.itemsPerPage = 2;
      const displayed = component.getDisplayedUsers();

      expect(displayed.length).toBe(2);
      expect(displayed[0].id).toBe('user-uuid-1');
      expect(displayed[1].id).toBe('user-uuid-2');
    });

    it('should calculate total pages', () => {
      component.filteredUsers = mockUsers;
      component.itemsPerPage = 2;

      expect(component.getTotalPages()).toBe(2);
    });

    it('should navigate to previous page', () => {
      component.currentPage = 2;
      component.previousPage();

      expect(component.currentPage).toBe(1);
    });

    it('should not go below page 1', () => {
      component.currentPage = 1;
      component.previousPage();

      expect(component.currentPage).toBe(1);
    });

    it('should navigate to next page', () => {
      component.filteredUsers = mockUsers;
      component.itemsPerPage = 2;
      component.currentPage = 1;
      component.nextPage();

      expect(component.currentPage).toBe(2);
    });

    it('should not go beyond total pages', () => {
      component.filteredUsers = mockUsers;
      component.itemsPerPage = 10;
      component.currentPage = 1;
      component.nextPage();

      expect(component.currentPage).toBe(1);
    });
  });

  describe('getTextCellValue', () => {
    it('should return masked value for masked cells', () => {
      const maskedCell = {
        key: 'password',
        dataKey: 'password' as const,
        masked: true,
      };
      const user = mockUsers[0];
      const value = component.getTextCellValue(maskedCell, user);

      expect(value).toBe('*****');
    });

    it('should return actual value for non-masked cells', () => {
      const cell = { key: 'email', dataKey: 'email' as const };
      const user = mockUsers[0];
      const value = component.getTextCellValue(cell, user);

      expect(value).toBe('user1@example.com');
    });
  });

  describe('openUserDetail', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should open user detail dialog', () => {
      jest.spyOn(matDialog, 'open').mockReturnValue({
        afterClosed: () => of(null),
      } as any);

      component.openUserDetail(mockUsers[0]);

      expect(matDialog.open).toHaveBeenCalledWith(UserDetailDialogComponent, {
        width: '480px',
        data: { user: mockUsers[0] },
      });
    });
  });

  describe('editUser', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should open edit dialog', () => {
      jest.spyOn(matDialog, 'open').mockReturnValue({
        afterClosed: () => of(null),
      } as any);

      component.editUser(mockUsers[0]);

      expect(matDialog.open).toHaveBeenCalled();
    });

    it('should update user after edit', (done) => {
      const updatedUser = { ...mockUsers[0], name: 'Updated User' };
      jest.spyOn(matDialog, 'open').mockReturnValue({
        afterClosed: () => of({ mode: 'edit', data: updatedUser }),
      } as any);

      component.editUser(mockUsers[0]);

      setTimeout(() => {
        expect(userService.updateUser).toHaveBeenCalledWith(
          updatedUser.id,
          expect.objectContaining({
            name: 'Updated User',
          }),
        );
        done();
      }, 100);
    });
  });

  describe('deleteUser', () => {
    beforeEach(async () => {
      await component.loadUsers();
      jest.spyOn(window, 'confirm').mockReturnValue(true);
    });

    it('should show confirmation dialog', () => {
      component.deleteUser(mockUsers[0]);

      expect(window.confirm).toHaveBeenCalled();
    });

    it('should delete user after confirmation', (done) => {
      component.deleteUser(mockUsers[0]);

      setTimeout(() => {
        expect(userService.deleteUser).toHaveBeenCalledWith('user-uuid-1');
        done();
      }, 100);
    });

    it('should not delete user if confirmation is cancelled', (done) => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      component.deleteUser(mockUsers[0]);

      setTimeout(() => {
        expect(userService.deleteUser).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('onItemsPerPageChange', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should update itemsPerPage and reset to page 1', () => {
      component.currentPage = 3;
      component.onItemsPerPageChange(50);

      expect(component.itemsPerPage).toBe(50);
      expect(component.currentPage).toBe(1);
    });
  });

  describe('getPaginationInfo', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should return pagination info string', () => {
      component.filteredUsers = mockUsers;
      component.currentPage = 1;
      component.itemsPerPage = 2;

      const info = component.getPaginationInfo();

      expect(info).toBeTruthy();
    });
  });

  describe('getPageNumbers', () => {
    beforeEach(async () => {
      await component.loadUsers();
    });

    it('should return page numbers for 5 or fewer pages', () => {
      component.filteredUsers = mockUsers;
      component.itemsPerPage = 1;
      component.currentPage = 1;

      const pages = component.getPageNumbers();

      expect(pages.length).toBe(3);
      expect(pages[0]).toBe(1);
      expect(pages[1]).toBe(2);
      expect(pages[2]).toBe(3);
    });

    it('should include ellipsis for many pages', () => {
      const manyUsers = Array.from({ length: 20 }, (_, i) => ({
        ...mockUsers[0],
        id: `user-${i}`,
      }));
      component.filteredUsers = manyUsers;
      component.currentPage = 1;
      component.itemsPerPage = 1;

      const pages = component.getPageNumbers();

      expect(pages).toContain('...');
    });
  });
});

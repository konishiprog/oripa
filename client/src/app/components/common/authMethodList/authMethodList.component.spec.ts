import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AuthMethod, AuthMethodListComponent } from './authMethodList.component';

describe('AuthMethodListComponent', () => {
  let component: AuthMethodListComponent;
  let fixture: ComponentFixture<AuthMethodListComponent>;
  let httpMock: HttpTestingController;

  const authMethods: AuthMethod[] = [
    { type: 'LINE', icon: 'assets/icons/line.svg', labelKey: 'line' },
    { type: 'EMAIL', icon: 'assets/icons/mail.svg', labelKey: 'email' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthMethodListComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthMethodListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    component.authMethods = authMethods;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load icons for each auth method', () => {
    component.ngOnInit();

    httpMock.expectOne('assets/icons/line.svg').flush('<svg></svg>');
    httpMock.expectOne('assets/icons/mail.svg').flush('<svg></svg>');

    expect(component.getIcon('assets/icons/line.svg')).toBeTruthy();
    expect(component.getIcon('assets/icons/mail.svg')).toBeTruthy();
  });

  it('should emit selected auth method', () => {
    const emitSpy = jest.spyOn(component.methodSelected, 'emit');

    component.selectMethod(authMethods[0]);

    expect(emitSpy).toHaveBeenCalledWith(authMethods[0]);
  });
});

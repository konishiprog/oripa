import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AppLogoComponent } from './appLogo.component';

describe('AppLogoComponent', () => {
  let component: AppLogoComponent;
  let fixture: ComponentFixture<AppLogoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppLogoComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLogoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load logo SVG on init', () => {
    const mockSvg = '<svg></svg>';
    fixture.detectChanges();

    const req = httpMock.expectOne(request => request.url.includes('assets/icons/logo.svg'));
    expect(req.request.method).toBe('GET');
    req.flush(mockSvg);

    expect(component.getIcon('assets/icons/logo.svg')).toBeTruthy();
  });

  it('should set class input correctly', () => {
    component.class = 'header-logo';
    fixture.detectChanges();

    const mockSvg = '<svg></svg>';
    const req = httpMock.expectOne(request => request.url.includes('assets/icons/logo.svg'));
    req.flush(mockSvg);

    fixture.detectChanges();
    expect(component.class).toBe('header-logo');
  });

  it('should handle logo load error gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    fixture.detectChanges();

    const req = httpMock.expectOne(request => request.url.includes('assets/icons/logo.svg'));
    req.error(new ErrorEvent('Network error'));

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

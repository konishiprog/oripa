import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupEmailSentComponent } from './signupEmailSent.component';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('SignupEmailSentComponent', () => {
  let component: SignupEmailSentComponent;
  let fixture: ComponentFixture<SignupEmailSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignupEmailSentComponent, MockTranslatePipe],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupEmailSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

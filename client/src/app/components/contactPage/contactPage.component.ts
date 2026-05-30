import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/user.service';
import { ContactService } from '../../service/contact.service';

@Component({
  selector: 'app-contact-page',
  standalone: false,
  templateUrl: './contactPage.component.html',
  styleUrls: [
    './contactPage.component.css',
    './contactPage.responsive.component.css',
  ],
})
export class ContactPageComponent implements OnInit {
  title: string = '';
  content: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private contactService: ContactService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translateService.setDefaultLang('ja');
    this.translateService.use('ja');

    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/userGachaPage']);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.title.trim() || !this.content.trim()) {
      this.showError('contact.error-required');
      return;
    }

    const userId = this.userService.getUserId();
    if (!userId) {
      this.router.navigate(['/userGachaPage']);
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await this.contactService.sendInquiry(
        userId,
        this.title.trim(),
        this.content.trim(),
      );
      this.showSuccess('contact.success');
      this.title = '';
      this.content = '';
    } catch (error) {
      this.showError('contact.error');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/userGachaPage']);
  }

  private showSuccess(key: string): void {
    this.successMessage = this.translateService.instant(key);
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  private showError(key: string): void {
    this.errorMessage = this.translateService.instant(key);
    this.successMessage = '';
    this.cdr.detectChanges();
  }
}

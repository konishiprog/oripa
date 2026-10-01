import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type AuthMethodType = 'LINE' | 'X' | 'GOOGLE' | 'EMAIL';

export interface AuthMethod {
  type: AuthMethodType;
  icon: string;
  labelKey: string;
}

@Component({
  selector: 'app-auth-method-list',
  templateUrl: './authMethodList.component.html',
  styleUrls: [
    './authMethodList.component.css',
    './authMethodList.responsive.component.css',
  ],
  standalone: false,
})
export class AuthMethodListComponent implements OnInit {
  @Input() authMethods: AuthMethod[] = [];
  @Output() methodSelected = new EventEmitter<AuthMethod>();
  private iconCache: Map<string, SafeHtml> = new Map();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadIcons();
  }

  private loadIcons(): void {
    this.authMethods.forEach((authMethod) => {
      this.http.get(authMethod.icon, { responseType: 'text' }).subscribe({
        next: (svg) => {
          this.iconCache.set(
            authMethod.icon,
            this.sanitizer.bypassSecurityTrustHtml(svg),
          );
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(`Failed to load icon ${authMethod.icon}:`, error.status);
        },
      });
    });
  }

  getIcon(iconPath: string): SafeHtml {
    return this.iconCache.get(iconPath) || '';
  }

  selectMethod(authMethod: AuthMethod): void {
    this.methodSelected.emit(authMethod);
  }
}

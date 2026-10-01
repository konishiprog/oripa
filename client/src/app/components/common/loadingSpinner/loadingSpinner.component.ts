import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loadingSpinner.component.html',
  styleUrls: ['./loadingSpinner.component.css'],
  standalone: false,
})
export class LoadingSpinnerComponent {
  @Input() diameter: number = 48;
}

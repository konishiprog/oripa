import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loadingOverlay.component.html',
  styleUrls: ['./loadingOverlay.component.css'],
  standalone: false,
})
export class LoadingOverlayComponent {
  @Input() isLoading: boolean = false;
  @Input() diameter: number = 60;
}

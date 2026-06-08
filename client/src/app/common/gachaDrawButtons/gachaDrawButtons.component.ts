import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DrawableGacha,
  GachaDrawService,
} from '../gacha-draw.service';

@Component({
  selector: 'app-gacha-draw-buttons',
  standalone: false,
  templateUrl: './gachaDrawButtons.component.html',
  styleUrls: [
    './gachaDrawButtons.component.css',
    './gachaDrawButtons.responsive.component.css',
  ],
})
export class GachaDrawButtonsComponent {
  @Input() gacha!: DrawableGacha;
  @Input() isLoggedIn: boolean = false;
  @Input() isDrawing: boolean = false;
  @Input() variant: 'compact' | 'full' = 'compact';

  @Output() drawRequested = new EventEmitter<number>();

  constructor(private gachaDrawService: GachaDrawService) {}

  effectiveDrawCount(requested: number): number {
    return this.gachaDrawService.effectiveDrawCount(this.gacha, requested);
  }

  onDraw(event: Event, count: number): void {
    event.stopPropagation();
    this.drawRequested.emit(count);
  }
}

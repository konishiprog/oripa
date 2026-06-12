import { Injectable } from '@angular/core';
import { CardService } from './card.service';
import { UserService, User } from './user.service';
import { GachaService } from './gacha.service';
import { CARD_STATUS } from '../constants/card';

export interface ShippingCardInfo {
  cardId: string;
  userId: string;
  userName: string;
  address: string;
  phone: string;
  gachaName: string;
  cardName: string;
  trackingNumber: string | null;
  status: 'pending' | 'shipped';
}

const DEFAULT_UNAVAILABLE_TEXT = '-';

@Injectable({
  providedIn: 'root',
})
export class ShippingInfoService {
  constructor(
    private cardService: CardService,
    private userService: UserService,
    private gachaService: GachaService,
  ) {}

  async getShippingCards(): Promise<ShippingCardInfo[]> {
    const allCards = await this.cardService.getAllCards();
    const allUsers = await this.userService.getAllUsers();
    const allGachas = await this.gachaService.getGachas();

    const shippingCards = allCards.filter(
      (card: any) =>
        card.isDrawn === CARD_STATUS.SHIPPING_PENDING ||
        card.isDrawn === CARD_STATUS.SHIPPED,
    );

    return shippingCards.map((card: any) => {
      const user = allUsers.find((user: User) => user.id === card.userId);
      const gacha = allGachas.find((gacha: any) => gacha.id === card.gachaId);
      const status =
        card.isDrawn === CARD_STATUS.SHIPPED ? 'shipped' : 'pending';

      return {
        cardId: card.id,
        userId: card.userId,
        userName: user
          ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
          : DEFAULT_UNAVAILABLE_TEXT,
        address:
          user && (user.prefecture || user.address || user.buildingName)
            ? `${user.prefecture || ''}${user.address || ''}${user.buildingName ? ' ' + user.buildingName : ''}`.trim()
            : DEFAULT_UNAVAILABLE_TEXT,
        phone: user?.phone || DEFAULT_UNAVAILABLE_TEXT,
        gachaName: gacha?.name || DEFAULT_UNAVAILABLE_TEXT,
        cardName: card.name || DEFAULT_UNAVAILABLE_TEXT,
        trackingNumber: card.trackingNumber || null,
        status,
      };
    });
  }
}

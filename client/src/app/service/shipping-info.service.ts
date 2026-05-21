import { Injectable } from '@angular/core';
import { CardService } from './card.service';
import { UserService, User } from './user.service';
import { GachaService } from './gacha.service';
import { CARD_STATUS } from '../constants/card';

export interface ShippingCardInfo {
  cardId: string;
  userName: string;
  address: string;
  phone: string;
  gachaName: string;
  cardName: string;
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
      (card: any) => card.isDrawn === CARD_STATUS.SHIPPING_PENDING,
    );

    return shippingCards.map((card: any) => {
      const user = allUsers.find((user: User) => user.id === card.userId);
      const gacha = allGachas.find((gacha: any) => gacha.id === card.gachaId);

      return {
        cardId: card.id,
        userName: user?.name || DEFAULT_UNAVAILABLE_TEXT,
        address: user?.address || DEFAULT_UNAVAILABLE_TEXT,
        phone: user?.phone || DEFAULT_UNAVAILABLE_TEXT,
        gachaName: gacha?.name || DEFAULT_UNAVAILABLE_TEXT,
        cardName: card.name || DEFAULT_UNAVAILABLE_TEXT,
      };
    });
  }
}

# Stripe 統合 - 仮想通貨チャージシステム

## 概要
Stripe を使用した仮想通貨チャージシステムの実装手順書です。
- クレジットカード、電子ウォレット対応
- 銀行振込は別途実装が必要

---

## フェーズ1: 準備

### 1.1 Stripe アカウント設定

1. [Stripe ダッシュボード](https://dashboard.stripe.com)にログイン
2. **設定 > API キー** から以下を取得：
   - **公開キー** (Publishable Key): `pk_*`
   - **シークレットキー** (Secret Key): `sk_*`
3. テストモードのキーであることを確認

### 1.2 環境変数の設定

`server/.env` に追加：
```env
STRIPE_SECRET_KEY=sk_test_***
STRIPE_PUBLISHABLE_KEY=pk_test_***
STRIPE_WEBHOOK_SECRET=whsec_*** # 後で設定
```

`client/src/environments/environment.ts` に追加：
```typescript
export const environment = {
  // ...
  stripe: {
    publishableKey: 'pk_test_***',
  },
};
```

### 1.3 依存ライブラリのインストール

**サーバー側：**
```bash
cd server
npm install stripe
npm install --save-dev @types/stripe
```

**クライアント側：**
```bash
cd client
npm install @stripe/stripe-js
```

---

## フェーズ2: データベース設計

### 2.1 モデル作成

**1. チャージ履歴テーブル**
```bash
cd server
npx sequelize-cli migration:generate --name create-charge-history
```

`migrations/[timestamp]-create-charge-history.js`:
```javascript
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ChargeHistories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '金額（円）',
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'JPY',
        allowNull: false,
      },
      coinAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '付与されたコイン枚数',
      },
      stripePaymentIntentId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'succeeded', 'failed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
      },
      paymentMethod: {
        type: Sequelize.STRING,
        comment: 'card, ideal, bancontact等',
      },
      failureReason: {
        type: Sequelize.TEXT,
        comment: '失敗理由',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('ChargeHistories');
  },
};
```

**2. モデル定義**

`models/ChargeHistory.ts`:
```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import { User } from './User';

export class ChargeHistory extends Model {
  declare id: string;
  declare userId: string;
  declare amount: number;
  declare currency: string;
  declare coinAmount: number;
  declare stripePaymentIntentId: string;
  declare status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  declare paymentMethod?: string;
  declare failureReason?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize) {
    ChargeHistory.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        amount: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        currency: {
          type: DataTypes.STRING,
          defaultValue: 'JPY',
        },
        coinAmount: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        stripePaymentIntentId: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        status: {
          type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'cancelled'),
          defaultValue: 'pending',
        },
        paymentMethod: DataTypes.STRING,
        failureReason: DataTypes.TEXT,
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'ChargeHistories',
        underscored: false,
      },
    );
  }

  static associate() {
    ChargeHistory.belongsTo(User, { foreignKey: 'userId' });
  }
}
```

### 2.2 マイグレーション実行

```bash
cd server
npx sequelize-cli db:migrate
```

---

## フェーズ3: バックエンド実装

### 3.1 Stripe サービス作成

`utils/stripeService.ts`:
```typescript
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentIntentRequest {
  userId: string;
  amount: number;
  coinAmount: number;
  currency?: string;
}

export async function createPaymentIntent(
  request: CreatePaymentIntentRequest,
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: request.amount * 100, // Stripeはセント単位
    currency: request.currency?.toLowerCase() || 'jpy',
    metadata: {
      userId: request.userId,
      coinAmount: request.coinAmount.toString(),
    },
  });

  return paymentIntent;
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
) {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    throw error;
  }
}
```

### 3.2 チャージ関連エンドポイント

`api/routes/chargeRoutes.ts`:
```typescript
import express, { Request, Response } from 'express';
import { models } from '../models';
import { createPaymentIntent, retrievePaymentIntent } from '../../utils/stripeService';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 支払いインテント作成
router.post('/charge/create-payment-intent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { amount, coinAmount } = req.body;
    const userId = (req as any).userId;

    if (!amount || !coinAmount) {
      return res.status(400).json({ error: '金額とコイン枚数は必須です' });
    }

    const paymentIntent = await createPaymentIntent({
      userId,
      amount,
      coinAmount,
    });

    // チャージ履歴をpending状態で作成
    const chargeHistory = await models.ChargeHistory.create({
      id: uuidv4(),
      userId,
      amount,
      coinAmount,
      currency: 'JPY',
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      chargeHistoryId: chargeHistory.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// チャージ履歴取得
router.get('/charge/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const histories = await models.ChargeHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(histories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// チャージ履歴詳細
router.get('/charge/history/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const history = await models.ChargeHistory.findOne({
      where: { id, userId },
    });

    if (!history) {
      return res.status(404).json({ error: 'チャージ履歴が見つかりません' });
    }

    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 3.3 Webhook ハンドラー

`api/routes/webhookRoutes.ts`:
```typescript
import express, { Request, Response, raw } from 'express';
import { models } from '../models';
import { verifyWebhookSignature } from '../../utils/stripeService';

const router = express.Router();

// Stripe webhook (bodyをそのままバッファとして受け取るため raw を使用)
router.post(
  '/webhooks/stripe',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const body = req.body;

    try {
      const event = verifyWebhookSignature(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as any);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as any);
          break;
        case 'payment_intent.canceled':
          await handlePaymentIntentCancelled(event.data.object as any);
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  },
);

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const chargeHistory = await models.ChargeHistory.findOne({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!chargeHistory) return;

  // チャージ履歴を成功に更新
  await chargeHistory.update({
    status: 'succeeded',
    paymentMethod: paymentIntent.payment_method_types[0],
  });

  // ユーザーのコイン残高を更新
  const user = await models.User.findByPk(chargeHistory.userId);
  if (user) {
    user.update({
      coinBalance: (user.coinBalance || 0) + chargeHistory.coinAmount,
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const chargeHistory = await models.ChargeHistory.findOne({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!chargeHistory) return;

  await chargeHistory.update({
    status: 'failed',
    failureReason: paymentIntent.last_payment_error?.message,
  });
}

async function handlePaymentIntentCancelled(paymentIntent: any) {
  const chargeHistory = await models.ChargeHistory.findOne({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!chargeHistory) return;

  await chargeHistory.update({
    status: 'cancelled',
  });
}

export default router;
```

### 3.4 runtime/app.ts にルートを統合

既存の `runtime/app.ts` に以下を追加：

```typescript
import chargeRoutes from '../api/routes/chargeRoutes';
import webhookRoutes from '../api/routes/webhookRoutes';

// ... 既存コード ...

app.use('/api', chargeRoutes);
app.use('/api', webhookRoutes);
```

---

## フェーズ4: フロントエンド実装

### 4.1 チャージサービス作成

`client/src/app/service/chargeService.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChargeRequest {
  amount: number;
  coinAmount: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  chargeHistoryId: string;
}

export interface ChargeHistory {
  id: string;
  amount: number;
  coinAmount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethod?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChargeService {
  constructor(private http: HttpClient) {}

  createPaymentIntent(request: ChargeRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      '/api/charge/create-payment-intent',
      request,
    );
  }

  getChargeHistory(): Observable<ChargeHistory[]> {
    return this.http.get<ChargeHistory[]>('/api/charge/history');
  }

  getChargeHistoryDetail(id: string): Observable<ChargeHistory> {
    return this.http.get<ChargeHistory>(`/api/charge/history/${id}`);
  }
}
```

### 4.2 チャージページコンポーネント

`client/src/app/components/chargeDemo/chargeDemo.component.ts`:
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChargeService, ChargeRequest } from '../../service/chargeService';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-charge-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="charge-container">
      <h2>仮想通貨チャージ</h2>

      <div class="charge-form">
        <div class="form-group">
          <label>チャージ額（円）</label>
          <input
            type="number"
            [(ngModel)]="chargeAmount"
            placeholder="1000"
            min="100"
            max="500000"
          />
        </div>

        <div class="coin-preview">
          <p>付与予定コイン: {{ estimatedCoins }} 枚</p>
          <small>（1円 = {{ conversionRate }} コイン）</small>
        </div>

        <button
          (click)="handleCharge()"
          [disabled]="!chargeAmount || isLoading"
          class="charge-btn"
        >
          {{ isLoading ? 'お待ちください...' : 'チャージする' }}
        </button>

        <!-- Stripe Elements で埋め込まれるコンテナ -->
        <div id="payment-element"></div>

        <div id="payment-message" *ngIf="paymentMessage" class="message">
          {{ paymentMessage }}
        </div>
      </div>

      <!-- チャージ履歴 -->
      <div class="charge-history" *ngIf="chargeHistories.length">
        <h3>チャージ履歴</h3>
        <table>
          <thead>
            <tr>
              <th>日時</th>
              <th>金額</th>
              <th>コイン</th>
              <th>ステータス</th>
              <th>支払い方法</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let history of chargeHistories">
              <td>{{ history.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td>¥{{ history.amount }}</td>
              <td>{{ history.coinAmount }}</td>
              <td [ngClass]="'status-' + history.status">{{ history.status }}</td>
              <td>{{ history.paymentMethod || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .charge-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .charge-form {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .coin-preview {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }

    .charge-btn {
      width: 100%;
      padding: 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    .charge-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .charge-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    #payment-element {
      margin: 20px 0;
    }

    .message {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }

    .message.success {
      background: #d4edda;
      color: #155724;
    }

    .message.error {
      background: #f8d7da;
      color: #721c24;
    }

    .charge-history {
      margin-top: 30px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f5f5f5;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .status-succeeded {
      color: #28a745;
      font-weight: 500;
    }

    .status-failed {
      color: #dc3545;
      font-weight: 500;
    }

    .status-pending {
      color: #ffc107;
      font-weight: 500;
    }
  `],
})
export class ChargeDemoComponent implements OnInit, OnDestroy {
  chargeAmount: number = 0;
  estimatedCoins: number = 0;
  conversionRate: number = 100; // 1円 = 100コイン（カスタマイズ可）
  isLoading: boolean = false;
  paymentMessage: string = '';
  chargeHistories: any[] = [];

  private stripe: Stripe | null = null;
  private elements: any = null;

  constructor(private chargeService: ChargeService) {}

  async ngOnInit() {
    await this.initializeStripe();
    this.loadChargeHistory();
  }

  ngOnDestroy() {
    // Stripe Elements のクリーンアップ
    if (this.elements) {
      this.elements.unmount();
    }
  }

  private async initializeStripe() {
    this.stripe = await loadStripe(environment.stripe.publishableKey);
    if (!this.stripe) {
      this.paymentMessage = 'Stripe の読み込みに失敗しました';
    }
  }

  async handleCharge() {
    if (!this.chargeAmount) {
      this.paymentMessage = 'チャージ額を入力してください';
      return;
    }

    this.isLoading = true;
    this.paymentMessage = '';

    try {
      const coinAmount = this.chargeAmount * this.conversionRate;

      const response = await this.chargeService
        .createPaymentIntent({
          amount: this.chargeAmount,
          coinAmount,
        })
        .toPromise();

      if (!response || !this.stripe) {
        throw new Error('支払い準備に失敗しました');
      }

      // Elements を作成（Payment Elements は自動で支払い方法を選択）
      const { elements } = await this.stripe.elements({
        clientSecret: response.clientSecret,
      });

      this.elements = elements;
      const paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');

      // 支払い処理
      const { error } = await this.stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/charge-result`,
        },
      });

      if (error) {
        this.paymentMessage = `エラー: ${error.message}`;
      }
    } catch (error: any) {
      this.paymentMessage = `エラー: ${error.message}`;
    } finally {
      this.isLoading = false;
    }
  }

  get estimatedCoins(): number {
    return this.chargeAmount * this.conversionRate;
  }

  private loadChargeHistory() {
    this.chargeService.getChargeHistory().subscribe({
      next: (histories) => {
        this.chargeHistories = histories;
      },
      error: (error) => {
        console.error('チャージ履歴の取得に失敗:', error);
      },
    });
  }
}
```

### 4.3 チャージ結果ページ

`client/src/app/components/chargeResult/chargeResult.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChargeService } from '../../service/chargeService';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-charge-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="result-container">
      <div *ngIf="loading" class="loading">
        <p>お待ちください...</p>
      </div>

      <div *ngIf="!loading && status === 'succeeded'" class="success">
        <h2>✓ チャージが完了しました</h2>
        <p>{{ coinAmount }} コインが付与されました</p>
        <p class="amount">¥{{ amount }}</p>
        <a routerLink="/charge" class="btn">チャージページに戻る</a>
      </div>

      <div *ngIf="!loading && status === 'failed'" class="error">
        <h2>✗ チャージに失敗しました</h2>
        <p>{{ errorMessage }}</p>
        <a routerLink="/charge" class="btn">もう一度試す</a>
      </div>

      <div *ngIf="!loading && status === 'pending'" class="pending">
        <h2>⏳ 処理中です</h2>
        <p>少しお待ちください...</p>
      </div>
    </div>
  `,
  styles: [`
    .result-container {
      max-width: 500px;
      margin: 100px auto;
      text-align: center;
      padding: 20px;
    }

    .loading, .pending {
      padding: 40px;
    }

    .success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 30px;
      color: #155724;
    }

    .error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 30px;
      color: #721c24;
    }

    .amount {
      font-size: 24px;
      font-weight: bold;
      margin: 15px 0;
    }

    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }

    .btn:hover {
      background: #0056b3;
    }
  `],
})
export class ChargeResultComponent implements OnInit {
  loading: boolean = true;
  status: string = 'pending';
  coinAmount: number = 0;
  amount: number = 0;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private chargeService: ChargeService,
  ) {}

  async ngOnInit() {
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret',
    );

    if (!clientSecret) {
      this.status = 'failed';
      this.errorMessage = 'payment_intent_client_secret が見つかりません';
      this.loading = false;
      return;
    }

    try {
      const stripe = await loadStripe(environment.stripe.publishableKey);
      if (!stripe) throw new Error('Stripe の読み込み失敗');

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

      if (!paymentIntent) {
        throw new Error('Payment Intent を取得できません');
      }

      this.status = paymentIntent.status;

      if (paymentIntent.metadata) {
        this.coinAmount = parseInt(paymentIntent.metadata.coinAmount || '0');
        this.amount = (paymentIntent.amount || 0) / 100;
      }

      if (paymentIntent.last_payment_error) {
        this.errorMessage = paymentIntent.last_payment_error.message;
      }
    } catch (error: any) {
      this.status = 'failed';
      this.errorMessage = error.message;
    } finally {
      this.loading = false;
    }
  }
}
```

### 4.4 ルーティング設定

`client/src/app/app.routes.ts` に追加：
```typescript
import { ChargeDemoComponent } from './components/chargeDemo/chargeDemo.component';
import { ChargeResultComponent } from './components/chargeResult/chargeResult.component';

export const routes = [
  // 既存ルート...
  { path: 'charge', component: ChargeDemoComponent },
  { path: 'charge-result', component: ChargeResultComponent },
];
```

### 4.5 環境設定

`client/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  stripe: {
    publishableKey: 'pk_test_***', // .env または手動で設定
  },
};
```

---

## フェーズ5: Webhook 設定

### 5.1 ローカルテスト用 Ngrok セットアップ

```bash
# Ngrok インストール (既にあれば不要)
brew install ngrok

# トンネル起動
ngrok http 3000

# 表示される URL: https://xxx.ngrok.io
```

### 5.2 Stripe Dashboard で Webhook 登録

1. **Settings > Webhooks** にアクセス
2. **Add an endpoint** をクリック
3. Endpoint URL: `https://xxx.ngrok.io/api/webhooks/stripe`
4. Events を選択：
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Signing secret をコピー → `.env` の `STRIPE_WEBHOOK_SECRET` に設定

---

## フェーズ6: テスト

### 6.1 テストカード情報

| 状況 | カード番号 | 有効期限 | CVC |
|------|-----------|--------|-----|
| 成功 | 4242 4242 4242 4242 | 任意の未来日 | 任意の3桁 |
| 認証必須 | 4000 0000 0000 3220 | 任意の未来日 | 任意の3桁 |
| 拒否 | 4000 0000 0000 0002 | 任意の未来日 | 任意の3桁 |

### 6.2 実装確認チェックリスト

- [ ] サーバー側：依存ライブラリのインストール完了
- [ ] サーバー側：マイグレーション実行確認
- [ ] サーバー側：チャージエンドポイント動作確認
- [ ] クライアント側：環境変数設定完了
- [ ] クライアント側：チャージページ表示確認
- [ ] Stripe Elements が正しく表示される
- [ ] テストカードで支払い処理が成功する
- [ ] Webhook でコイン付与が確認できる
- [ ] エラーハンドリングが適切に動作する

### 6.3 デバッグ時のログ確認

**サーバー側：**
```bash
cd server
npm run dev # ts-node で起動
```

**クライアント側：**
```bash
cd client
npm start # ng serve で起動
```

ブラウザコンソール (F12) で Stripe 関連のエラーを確認。

---

## フェーズ7: 本番環境への移行

1. **Stripe アカウント** → Live キーに切り替え
2. **.env** → 本番用シークレットキーを設定
3. **environment.ts** → 本番用公開キーに更新
4. **Webhook** → 本番用エンドポイントで再登録
5. **決済手数料確認** → Stripe 手数料は約3.6% + 固定手数料

---

## 補足: 銀行振込対応（別途実装）

Stripe は日本の銀行振込に直接対応していません。以下の選択肢があります：

### 選択肢1: 支払いプロバイダーの変更
- GMO-PG、SBペイメント等の日本サービス利用

### 選択肢2: 手動実装
- 銀行口座情報を表示
- ユーザーが振込確認ページで支払い番号（参照番号）を入力
- 管理者が入金確認後、コイン手動付与

現在の実装は**クレジットカード + 電子ウォレット** に対応しています。

---

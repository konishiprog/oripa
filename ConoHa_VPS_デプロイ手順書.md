# ConoHa VPS デプロイ手順書

ローカルで動作しているOripaアプリケーション（Angular + Node.js + PostgreSQL）をConoHa VPS上で公開するための完全手順。

## 環境概要

| コンポーネント | 役割 | ポート |
|---|---|---|
| Angular (Client) | フロントエンド | 4200 → 80/443 |
| Node.js (Server) | バックエンド API | 3000 |
| PostgreSQL | データベース | 5432 |
| Nginx | リバースプロキシ | 80/443 |

---

## 第1段階：ConoHa VPS 初期セットアップ

### 1-1. VPS準備
1. [ConoHa コントロールパネル](https://cp.conoha.jp/VPS/Dashboard)にログイン
2. **既存VPSがある場合**: 左上「サーバー」タブで既に起動しているVPSを確認
3. **新規VPSが必要な場合**: 左上の「+ サーバー追加」ボタンをクリック
   - **推奨OS設定**
     - OS: **Ubuntu 24.04 LTS** または **Debian 12**
     - プラン: 2GB RAM以上
   - rootパスワードをメモ

### 1-2. 初期ログイン＆ユーザー設定

```bash
# rootでSSH接続
ssh root@<VPS_IP>

# システムアップデート
apt update && apt upgrade -y

# 新しいユーザー作成（rootでの直接操作を避けるため）
adduser oripa
usermod -aG sudo oripa

# SSH設定（より安全に）
sudo vi /etc/ssh/sshd_config

# 以下を追加/変更:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

sudo systemctl restart sshd
```

### 1-3. ファイアウォール設定

```bash
# UFWを有効化
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw enable

# 設定確認
sudo ufw status
```

### 1-4. 接続方法について

⚠️ **SSH 外部接続が確立されない場合の対処**

ConoHa VPSでは外部からのSSH接続がすぐに確立されないことがあります。その場合は、**VNCコンソール**を使用してください：

1. ConoHa ダッシュボード → VPS詳細 → 左メニュー「**コンソール**」
2. 「**VNCコンソール**」ボタンで VPS に直接アクセス
3. VNCコンソール上で全ての設定・インストールを実行可能

以下の手順（第2段階以降）は、VNCコンソール上でも Mac ターミナルでも実行可能です。

---

## 第2段階：Docker・Docker Compose インストール

### 2-1. Docker インストール

⚠️ **推奨方法：Docker 公式インストールスクリプト**

複雑なリポジトリ設定を避けるため、公式の自動インストールスクリプトを使用します：

```bash
# Dockerの自動インストールスクリプトをダウンロード・実行
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# ユーザーを dockergroup に追加（sudoなしでコマンド実行可）
sudo usermod -aG docker oripa

# Docker が正常にインストールされたか確認
docker --version
docker compose version
```

**トラブルシューティング**
- スクリプトが失敗する場合は、`apt update && apt upgrade -y` を先に実行してからリトライしてください。

### 2-2. Docker Compose バージョン確認

Docker公式スクリプトでインストール済みので、バージョン確認：

```bash
docker compose version
```

出力例：
```
Docker Compose version v5.1.4
```

---

## 第3段階：アプリケーションのセットアップ

### 3-1. リポジトリをクローン

VNCコンソール上で実行：

```bash
# ディレクトリ作成
mkdir -p /root/oripa
cd /root

# GitHubリポジトリをクローン
git clone https://github.com/konishiprog/oripa.git
cd oripa
git checkout develop

# ファイル確認
ls -la
```

正常なら `client` と `server` ディレクトリが見えます。

### 3-2. 環境変数の設定

#### server/.env ファイル作成

VNCコンソール上で以下をコピペ：

```bash
cat > server/.env << 'EOF'
DB_HOST=db
DB_PORT=5432
DB_USER=user
DB_PASS=TestPass123
DB_NAME=oripa
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=oripa
DATABASE_USER=user
DATABASE_PASSWORD=TestPass123
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
STRIPE_SECRET_KEY=sk_test_51Tgzb0K3pSUgziN3R5cxqK1dzQ0Ri0r38yX0rNKZkeJHdYmkGfZbEi2zrQ3L3OKdhfIqjIV2lNJZGyNYPjfClu6t00uneImJ3u
STRIPE_PUBLISHABLE_KEY=pk_test_51Tgzb0K3pSUgziN3fQEmWvQyZ7CjT9RoAOKMCEbv9BjMgCd7ECrNTTYjWiV6cNZJdu0ouYLlUIVLceajy4gzyD5O00j2N1Ipc4
STRIPE_WEBHOOK_SECRET=whsec_Uuy5BGxhCKeXQfF6feAasVu8QkUN5CXg
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=support@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.local
ADMIN_PASSWORD=AdminSecurePass2024
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
EOF
```

**設定内容の説明**:

| 設定項目 | 説明 | 変更が必要な箇所 |
|---|---|---|
| `DATABASE_PASSWORD` | PostgreSQL パスワード | 本番環境では強力なパスワード推奨 |
| `CLIENT_URL` | フロントエンド URL | `yourdomain.com` → 実際のドメイン |
| `SERVER_URL` | バックエンド API URL | `api.yourdomain.com` → 実際のドメイン |
| `ALLOWED_ORIGINS` | CORS許可ドメイン | `yourdomain.com` → 実際のドメイン |
| `STRIPE_*` | Stripe API キー | 本番環境では `sk_live_` を使用 |
| `RESEND_API_KEY` | メール送信API | Resend ダッシュボードから取得 |

⚠️ **セキュリティ注意**
- APIキーは本番環境では絶対にコミットしない
- `.gitignore` に `.env` が登録されていることを確認

確認：
```bash
cat server/.env
```

### 3-3. Docker Compose で起動

```bash
cd /root/oripa
docker compose up -d
```

起動ログが表示されます。完了後：

```bash
docker compose ps
```

**成功時の表示例**:
```
NAME              STATUS              PORTS
oripa-db          Up 26 seconds       0.0.0.0:5433->5432/tcp
oripa-server      Up 25 seconds       0.0.0.0:3000->3000/tcp
oripa-client      Up 25 seconds       0.0.0.0:4200->4200/tcp
```

全コンテナが `Up` 状態なら成功です。

### 3-4. ログ確認

エラーがないか確認：

```bash
docker compose logs -f
```

Ctrl+C で終了。

---

## 第4段階：Nginxリバースプロキシ設定

### 4-1. Nginx インストール

```bash
sudo apt install -y nginx

# Nginxを起動・自動起動設定
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4-2. SSL証明書取得（Let's Encrypt）

```bash
# Certbotをインストール
sudo apt install -y certbot python3-certbot-nginx

# ドメイン設定済みの場合：
sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

# メールアドレスと利用規約に同意
```

### 4-3. Nginx 設定ファイル

```bash
# バックアップ
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# 新しい設定を作成
sudo nano /etc/nginx/sites-available/oripa
```

**設定内容**:

```nginx
# HTTPをHTTPSにリダイレクト
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# クライアント（フロントエンド）
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL設定（セキュリティ強化）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/html;
    index index.html;

    location / {
        proxy_pass http://localhost:4200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API サーバー
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORSヘッダ設定（必要に応じて）
        add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com' always;
    }
}
```

### 4-4. Nginx 有効化

```bash
# シンボリックリンク作成
sudo ln -s /etc/nginx/sites-available/oripa /etc/nginx/sites-enabled/oripa

# デフォルト設定を無効化（衝突防止）
sudo rm /etc/nginx/sites-enabled/default

# 設定を確認
sudo nginx -t

# 反映
sudo systemctl reload nginx
```

---

## 第5段階：アプリケーション起動

### 5-1. Docker Compose で起動

```bash
cd /home/oripa/oripa

# イメージをビルド・起動
docker compose up -d

# ステータス確認
docker compose ps

# ログ確認
docker compose logs -f server  # サーバーログ
docker compose logs -f client  # クライアントログ
docker compose logs -f db      # DBログ
```

### 5-2. データベース初期化

```bash
# マイグレーション実行（初回のみ）
docker compose exec server npm run migrate
# または
docker compose exec server npx sequelize-cli db:migrate
```

---

## 第6段階：ドメイン設定

### 6-1. DNS レコード設定

ConoHa のコントロールパネルまたはドメインレジストラで以下を設定：

| レコード種 | ホスト名 | 値 |
|---|---|---|
| A | yourdomain.com | \<VPS_IP\> |
| A | api.yourdomain.com | \<VPS_IP\> |
| A | www.yourdomain.com | \<VPS_IP\> |

### 6-2. 伝播確認

```bash
# DNS伝播確認（5〜24時間かかることもある）
nslookup yourdomain.com
dig yourdomain.com @8.8.8.8
```

---

## 第7段階：動作確認

### 7-1. ブラウザテスト

```
https://yourdomain.com          # フロントエンド
https://api.yourdomain.com/api  # API（エンドポイント確認）
```

### 7-2. ログ確認

```bash
# サーバーログ
docker compose logs -f server

# Nginxアクセスログ
sudo tail -f /var/log/nginx/access.log

# エラーログ
sudo tail -f /var/log/nginx/error.log
```

---

## 第8段階：運用・保守

### 8-1. SSL証明書の自動更新

```bash
# Certbot自動更新の確認
sudo systemctl enable certbot.timer
sudo systemctl status certbot.timer

# 手動更新
sudo certbot renew --dry-run  # テスト
sudo certbot renew             # 実行
```

### 8-2. コンテナの再起動

```bash
# 全コンテナ再起動
docker compose restart

# 特定のコンテナ再起動
docker compose restart server

# コードのデプロイ時
git pull origin develop
docker compose up -d --build
```

### 8-3. バックアップ

```bash
# データベースバックアップ
docker compose exec db pg_dump -U user oripa > backup_$(date +%Y%m%d_%H%M%S).sql

# 定期バックアップ（cronジョブ）
crontab -e

# 以下を追加（毎日午前2時に実行）
0 2 * * * docker compose -f /home/oripa/oripa/docker-compose.yml exec -T db pg_dump -U user oripa > /home/oripa/backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### 8-4. 監視・ログ

```bash
# リアルタイムモニタリング
docker stats

# ディスク使用量確認
df -h

# ログサイズ制限設定（無制限増長防止）
docker logging-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3
```

---

## トラブルシューティング

### SSH・ネットワーク関連

| 問題 | 原因 | 解決策 |
|---|---|---|
| SSH接続がタイムアウト | ネットワーク未接続 | VNCコンソールで `ping 8.8.8.8` 確認、またはVPSを再起動 |
| Pingが通らない | ファイアウォール制限 | UFWで許可を確認：`sudo ufw allow 22/tcp` |
| VPS起動済みだがSSH不可 | コンソール経由で作業 | ConoHa ダッシュボーム → VNCコンソールを使用 |

### Docker インストール関連

| 問題 | 原因 | 解決策 |
|---|---|---|
| `apt-add-repository` コマンドエラー | 古い構文 | 公式スクリプト `get-docker.sh` を使用 |
| ディレクトリ作成失敗 | `/usr/share/keyrings/` 権限 | `mkdir -p /usr/share/keyrings/` で作成 |
| Docker スクリプト失敗 | パッケージ情報が古い | `apt update && apt upgrade -y` 先に実行 |

### アプリケーション関連

| 問題 | 原因 | 解決策 |
|---|---|---|
| DBに接続できない | 環境変数ミス | `docker compose logs db` で確認、再設定後 `docker compose restart` |
| SSLエラー | 証明書未取得 | `sudo certbot certonly --nginx -d yourdomain.com` 再実行 |
| 503エラー | バックエンド未起動 | `docker compose up -d` 再実行、`docker compose ps` で確認 |
| ポート競合 | 既に使用中 | `lsof -i :80` で確認、不要なプロセス終了 |
| メモリ不足 | コンテナサイズ不足 | `docker compose down`、VPSプランアップグレード |

---

## セキュリティチェックリスト

- [ ] ファイアウォール (UFW) が有効化されている
- [ ] SSH パスワード認証が無効化されている
- [ ] `.env` ファイルが `.gitignore` に登録されている
- [ ] SSL/TLS が有効化されている（HTTPS のみ）
- [ ] データベースパスワードが強力である
- [ ] Stripe・Resend APIキーが環境変数で管理されている
- [ ] CORSが適切に設定されている（信頼できるドメインのみ）
- [ ] 定期的なバックアップが設定されている

---

## 参考リンク

- [ConoHa VPS](https://www.conoha.jp/vps/)
- [Docker 公式](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx 公式](https://nginx.org/)

---

**最終更新**: 2026年6月12日

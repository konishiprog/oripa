const express = require('express');
const app = express();

const PORT = 3000;

// ミドルウェア
app.use(express.json());

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API テスト
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

const express = require('express');
const path = require('path');

const app = express();
const distPath = path.join(__dirname, 'dist/app/browser');

app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false,
  index: false,
}));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

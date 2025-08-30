import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 明确设置 MIME 类型
app.use(express.static(path.join(__dirname, '../web'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // 其他文件类型会由 Express 自动处理
  }
}));

// 处理 favicon.ico 请求
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// 阻止对 Google Fonts 的请求
app.use((req, res, next) => {
  if (req.url.includes('fonts.googleapis.com') || req.url.includes('fonts.gstatic.com')) {
    res.status(204).end(); // 返回空响应
    return;
  }
  next();
});

// 内存级存储
const store = new Map();

// 创建祈福
app.post('/api/create', (req, res) => {
  const { name, wish } = req.body;
  if (!name || !wish) return res.status(400).json({ error: '缺少字段' });
  const id = uuid().slice(0, 8).toUpperCase();
  store.set(id, { name, wish, createdAt: Date.now() });
  setTimeout(() => store.delete(id), 72 * 3600_000);
  res.json({ id });
});

// 焚毁
app.post('/api/burn', (req, res) => {
  const { id } = req.body;
  if (!store.has(id)) return res.status(404).json({ error: '祝福已消散' });
  store.delete(id);
  res.json({ status: 'burned' });
});

// 获取能量报告
app.get('/api/report/:id', (req, res) => {
  const { id } = req.params;
  if (!store.has(id)) return res.status(404).json({ error: '报告已消失' });
  const { name, wish } = store.get(id);
  
  // 生成更丰富的报告数据
  const intensity = Math.floor(Math.random() * 20 + 80); // 80-100%
  const freq = (432 + Math.random() * 10 - 5).toFixed(2); // 432Hz 附近波动
  const ttl = '24h';
  const coords = '猎户座旋臂·银河历2023.12.01';
  const energyLevel = Math.floor(Math.random() * 5) + 1; // 能量等级 1-5
  const resonance = Math.random() > 0.5 ? '高' : '中';
  
  res.json({
    name,
    wish,
    intensity,
    freq,
    ttl,
    coords,
    energyLevel,
    resonance
  });
});

// 确保所有其他请求都返回 index.html (用于前端路由)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// 启动服务器
app.listen(PORT, () => console.log(`✨ Server ready at http://localhost:${PORT}`));
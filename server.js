const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const statusRoutes = require('./routes/status');
const historyRoutes = require('./routes/history');
const adminRoutes = require('./routes/admin');

const app = express();
const port = 3301;

app.use(express.json());
app.use(cors());

app.use('/api', authRoutes);
app.use('/api', statusRoutes);
app.use('/api', historyRoutes);
app.use('/api', adminRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
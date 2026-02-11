const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const segredo = process.env.SEGREDO;

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, segredo, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.usuario = usuario;
    next();
  });
}

module.exports = { autenticarToken, segredo };

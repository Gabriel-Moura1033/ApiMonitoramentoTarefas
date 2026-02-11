const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { autenticarToken, segredo } = require('../middleware/auth');
const checkUserActive = require('../middleware/checkUserActive');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, JWT_CONFIG } = require('../constants');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  let conn;

  try {
    conn = await db.getConnection();
    const senhaHash = await bcrypt.hash(senha, 10);

    await conn.execute(
      'INSERT INTO USUARIOS (NOME, EMAIL, SENHA_HASH) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    res.status(HTTP_STATUS.CREATED).json({
      message: SUCCESS_MESSAGES.USER_REGISTERED
    });

  } catch (err) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.REGISTRATION_ERROR
    });
  } finally {
    if (conn) conn.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  let conn;

  try {
    conn = await db.getConnection();

    const queryResult = await conn.query(
      'SELECT * FROM USUARIOS WHERE EMAIL = ?',
      [email]
    );
    const usuario = queryResult[0];

    if (!usuario) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    if (!usuario.ATIVO) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.USER_INACTIVE
      });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.SENHA_HASH);

    if (!senhaConfere) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.INCORRECT_PASSWORD
      });
    }

    const token = jwt.sign(
      { id: usuario.ID, email: usuario.EMAIL },
      segredo,
      { expiresIn: JWT_CONFIG.EXPIRES_IN }
    );

    res.json({ token });

  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/protegido', autenticarToken, checkUserActive, async (req, res) => {
  res.json({
    message: 'Você acessou uma rota protegida!'
  });
});

module.exports = router;

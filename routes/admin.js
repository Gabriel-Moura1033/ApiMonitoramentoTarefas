const express = require('express');
const db = require('../db');
const { autenticarToken } = require('../middleware/auth');
const checkUserActive = require('../middleware/checkUserActive');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

const router = express.Router();

router.get('/usuariosAtivos', autenticarToken, checkUserActive, async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const adminCheck = await conn.query(
            'SELECT ADMIN FROM USUARIOS WHERE EMAIL = ?',
            [req.usuario.email]
        );

        if (!adminCheck[0] || !adminCheck[0].ADMIN) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                error: ERROR_MESSAGES.ADMIN_ONLY
            });
        }

        const queryResult = await conn.query(
            `SELECT 
        NOME,
        ULTIMO_LOGIN
      FROM USUARIOS
      WHERE ULTIMO_LOGIN IS NOT NULL
      ORDER BY ULTIMO_LOGIN DESC, NOME`
        );

        if (!queryResult) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: ERROR_MESSAGES.INTERNAL_ERROR
            });
        }

        const formatado = queryResult.map(item => ({
            ...item,
            ULTIMO_LOGIN: item.ULTIMO_LOGIN?.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo'
            })
        }));

        res.status(HTTP_STATUS.CREATED).json(formatado);

    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_ERROR
        });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;

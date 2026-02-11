const express = require('express');
const db = require('../db');
const { autenticarToken } = require('../middleware/auth');
const checkUserActive = require('../middleware/checkUserActive');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, DB_CONFIG } = require('../constants');

const router = express.Router();

router.get('/history', autenticarToken, checkUserActive, async (req, res) => {
    const cliente = req.query.cliente;
    let conn;

    try {
        conn = await db.getConnection();

        const queryResult = await conn.query(
            `SELECT DISTINCT 
        TIMESTAMP(
          DATE(C.DATA_HORA),
          MAKETIME(HOUR(C.DATA_HORA), MINUTE(C.DATA_HORA), 0)
        ) AS DATA_HORA
      FROM CLIENTES A
      JOIN CLIENTES_SDA B ON A.CLIENTE_ID = B.CLIENTE_ID
      JOIN LOG_FALHAS C ON B.CLIENTE_SDA_ID = C.CLIENTE_SDA_ID
      WHERE A.NOME = ?
        AND C.DATA_HORA >= NOW() - INTERVAL ? DAY
      UNION
      SELECT TIMESTAMP(
        DATE(NOW()),
        MAKETIME(HOUR(NOW()), MINUTE(NOW()), 0)
      ) AS DATA_HORA
      FROM CLIENTES A
      JOIN CLIENTES_SDA B ON A.CLIENTE_ID = B.CLIENTE_ID
      WHERE A.NOME = ?
        AND B.FALHA = 1
      UNION
      SELECT TIMESTAMP(
        DATE(NOW() + INTERVAL 1 MINUTE),
        MAKETIME(HOUR(NOW() + INTERVAL 1 MINUTE), MINUTE(NOW() + INTERVAL 1 MINUTE), 0)
      ) AS DATA_HORA
      FROM CLIENTES A
      JOIN CLIENTES_SDA B ON A.CLIENTE_ID = B.CLIENTE_ID
      WHERE A.NOME = ?
        AND B.FALHA = 1
      ORDER BY 1 DESC`,
            [cliente, DB_CONFIG.HISTORY_INTERVAL_DAYS, cliente, cliente]
        );

        if (!queryResult || queryResult.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                message: SUCCESS_MESSAGES.NO_ERRORS_FOUND
            });
        }

        const formatado = queryResult.map(row => {
            const d = new Date(row.DATA_HORA);
            const ano = d.getFullYear();
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const dia = String(d.getDate()).padStart(2, '0');
            const hora = String(d.getHours()).padStart(2, '0');
            const minuto = String(d.getMinutes()).padStart(2, '0');
            return `${ano}-${mes}-${dia} ${hora}:${minuto}`;
        });

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

const express = require('express');
const db = require('../db');
const { autenticarToken } = require('../middleware/auth');
const checkUserActive = require('../middleware/checkUserActive');
const { HTTP_STATUS, ERROR_MESSAGES, DB_CONFIG } = require('../constants');

const router = express.Router();

router.get('/status', autenticarToken, checkUserActive, async (req, res) => {
    let conn;

    try {
        conn = await db.getConnection();

        const queryResult = await conn.query(
            `SELECT 
        A.CLIENTE_ID,
        A.NOME AS cliente,
        B.FALHA,
        IFNULL(B.FALHA_COSMOS, 0) AS FALHA_COSMOS,
        B.FALHAS_CONSECUTIVAS AS falhas,
        B.ULTIMO_TESTE AS ultimoTeste,
        B.ULTIMO_SUCESSO AS ultimoSucesso,
        B.CUSTOM_ACTION AS customAction
      FROM CLIENTES A
      JOIN CLIENTES_SDA B ON A.CLIENTE_ID = B.CLIENTE_ID
      WHERE A.ATIVO = 1
      ORDER BY B.FALHAS_CONSECUTIVAS DESC
      LIMIT ?`,
            [DB_CONFIG.QUERY_LIMIT]
        );

        if (!queryResult) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: ERROR_MESSAGES.INTERNAL_ERROR
            });
        }

        const formatado = queryResult.map(item => ({
            ...item,
            ultimoTeste: item.ultimoTeste?.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo'
            }),
            ultimoSucesso: item.ultimoSucesso?.toLocaleString('pt-BR', {
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

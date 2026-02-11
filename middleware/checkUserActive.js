const db = require('../db');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

async function checkUserActive(req, res, next) {
    let conn;

    try {
        conn = await db.getConnection();

        await conn.query(
            'UPDATE USUARIOS SET ULTIMO_LOGIN = NOW() WHERE EMAIL = ?',
            [req.usuario.email]
        );

        const queryResult = await conn.query(
            'SELECT ATIVO FROM USUARIOS WHERE EMAIL = ?',
            [req.usuario.email]
        );

        const usuario = queryResult[0];

        if (!usuario || !usuario.ATIVO) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                error: ERROR_MESSAGES.USER_INACTIVE
            });
        }

        next();

    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_ERROR
        });
    } finally {
        if (conn) conn.release();
    }
}

module.exports = checkUserActive;

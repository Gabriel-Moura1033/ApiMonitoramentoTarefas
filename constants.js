const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'Usuário não encontrado',
    USER_INACTIVE: 'Usuário Inativo. Contate o administrador',
    INCORRECT_PASSWORD: 'Senha incorreta',
    INTERNAL_ERROR: 'Erro interno',
    REGISTRATION_ERROR: 'Erro ao cadastrar',
    UNAUTHORIZED_ACCESS: 'Acesso não autorizado',
    ADMIN_ONLY: 'Acesso restrito a administradores'
};

const SUCCESS_MESSAGES = {
    USER_REGISTERED: 'Usuário cadastrado com sucesso',
    NO_ERRORS_FOUND: 'Nenhum erro encontrado'
};

const JWT_CONFIG = {
    EXPIRES_IN: '24h'
};

const DB_CONFIG = {
    QUERY_LIMIT: 100,
    HISTORY_INTERVAL_DAYS: 1
};

module.exports = {
    HTTP_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    JWT_CONFIG,
    DB_CONFIG
};

CREATE TABLE Admins (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Acampantes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    saldo BIGINT NOT NULL DEFAULT 0 CHECK (saldo >= 0),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Itens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco_centavos BIGINT NOT NULL CHECK (preco_centavos >= 0),
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Transacoes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    acampante_id BIGINT NOT NULL REFERENCES Acampantes(id),
    item_id BIGINT NOT NULL REFERENCES Itens(id),
    admin_id BIGINT NOT NULL REFERENCES Admins(id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario_centavos BIGINT NOT NULL CHECK (preco_unitario_centavos >= 0),
    data_transacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transacoes_acampante ON Transacoes(acampante_id);
CREATE INDEX idx_transacoes_item ON Transacoes(item_id);
CREATE INDEX idx_transacoes_data ON Transacoes(data_transacao DESC);

CREATE TABLE IF NOT EXISTS RefreshTokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES Admins(id) ON DELETE CASCADE,
    token_hash CHAR(64) UNIQUE NOT NULL,
    familia UUID NOT NULL,
    expira_em TIMESTAMPTZ NOT NULL,
    revogado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_admin ON RefreshTokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_refresh_familia ON RefreshTokens(familia);
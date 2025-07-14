CREATE DATABASE contabilize;
USE contabilize;


CREATE TABLE produto (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome TEXT NOT NULL,
    tipo_embalagem TEXT NULL, -- Copo, Tigela, Barca
    tamanho TEXT NULL, -- P, M, G ou ml para copo
    preco_venda DECIMAL(5,2) NOT NULL,
    numero_adicionais INT NULL,
    preco_custo DECIMAL(5,2) NULL,
    estoque_minimo INT NULL,
    unidade_medida TEXT NULL,
    estoque INT NULL,
    categoria TEXT NOT NULL
);

-- Tabela de Insumos (Sabores e outros insumos como copo, canudo, etc.)
CREATE TABLE insumo (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome TEXT NOT NULL,
    estoque_minimo INT NOT NULL,
    unidade_medida TEXT NOT NULL,
    estoque INT NOT NULL,
    preco_custo DECIMAL(5,2) NOT NULL
);

-- Tabela para Quantidade de Insumos Utilizados na Preparação do Produto
CREATE TABLE produto_insumo (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    id_produto INT NOT NULL,
    id_insumo INT NOT NULL,
    unidade_medida TEXT NOT NULL, -- Referente a quantidade 
    quantidade TEXT NOT NULL, -- Quantidade usada na preparação
    FOREIGN KEY (id_produto) REFERENCES produto(id),
    FOREIGN KEY (id_insumo) REFERENCES insumo(id)
);

CREATE TABLE pedido (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cpf_cliente TEXT NULL
);

CREATE TABLE pedido_produto (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL, 
    adicionais TEXT NULL,           -- Adicionais como um array ou string serializada
    observacao TEXT NULL,           -- Observações do cliente
    status TEXT NULL,           -- Status do pedido (por exemplo: "pendente", "pronto")
    nome_cliente TEXT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id),
    FOREIGN KEY (id_produto) REFERENCES produto(id)
);

CREATE TABLE venda (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    total decimal (6,2) NOT NULL,
    status TEXT NOT NULL,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_pedido INT NOT NULL,
    
    FOREIGN KEY (id_pedido) REFERENCES pedido (id)
);

CREATE TABLE forma_pagamento (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome TEXT NOT NULL
);

CREATE TABLE pagamento_venda (
    id_venda INT NOT NULL,
    id_pagamento INT NOT NULL,
    valor DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (id_venda) REFERENCES venda(id),
    FOREIGN KEY (id_pagamento) REFERENCES forma_pagamento(id),
    PRIMARY KEY (id_venda, id_pagamento, valor)
);

CREATE TABLE despesa (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, 
    recorrencia TEXT NOT NULL,
    nome TEXT NOT NULL,
    valor decimal(6,2) NOT NULL,
    data_despesa TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);


CREATE TABLE administrador (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome_adm TEXT NOT NULL,
    email TEXT NOT NULL,
    senha TEXT NOT NULL,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT NULL,
    endereco_empresa TEXT NULL,
    telefone TEXT NULL,
    gerenciar_status_pedido TEXT NOT NULL
);

-- funções

-- função para converter unidade de medida de peso
DELIMITER //
CREATE FUNCTION converter_unidade(valor DECIMAL(10,2), unidade_origem TEXT, unidade_destino TEXT)
RETURNS DECIMAL(10,2)
BEGIN
    IF unidade_origem = 'grama' AND unidade_destino = 'kg' THEN
        RETURN valor / 1000;
    ELSEIF unidade_origem = 'kg' AND unidade_destino = 'grama' THEN
        RETURN valor * 1000;
    ELSE
        RETURN valor; -- Se as unidades forem iguais, retorna o valor original
    END IF;
END;
//

-- função para converter unidade de medida de volume

CREATE FUNCTION converter_unidade(valor DECIMAL(10,2), unidade_origem TEXT, unidade_destino TEXT)
RETURNS DECIMAL(10,2)
BEGIN
    IF unidade_origem = 'ml' AND unidade_destino = 'litro' THEN
        RETURN valor / 1000;
    ELSEIF unidade_origem = 'litro' AND unidade_destino = 'ml' THEN
        RETURN valor * 1000;
    ELSE
        RETURN valor; -- Se as unidades forem iguais, retorna o valor original
    END IF;
END;
//
DELIMITER ;
-- triggers

-- trigger para atualizar o estoque após a inserção de um pedido
CREATE TRIGGER atualizar_estoque
AFTER INSERT ON pedido_produto
FOR EACH ROW
BEGIN
    DECLARE quantidade_utilizada DECIMAL(10, 2);
    DECLARE unidade_insumo TEXT;

    -- Obtenha a quantidade e a unidade de medida do insumo
    SELECT quantidade, unidade_medida INTO quantidade_utilizada, unidade_insumo
    FROM produto_insumo
    WHERE id_produto = NEW.id_produto;

    -- Atualize o estoque do insumo
    UPDATE insumo
    SET estoque = estoque - converter_unidade(quantidade_utilizada * NEW.quantidade, unidade_insumo, unidade_medida)
    WHERE id = (SELECT id_insumo FROM produto_insumo WHERE id_produto = NEW.id_produto);
END;

--inserções

INSERT INTO produto (nome, tipo_embalagem, tamanho, preco_venda, numero_adicionais, preco_custo, estoque_minimo, unidade_medida, estoque, categoria)
VALUES
('Açaí Copo', 'Copo', '500ml', 20.00, 5, NULL, 10, 'ml', NULL, 'Preparado'),
('Sorvete Casquinha', 'Casquinha', NULL, 6.00, NULL, NULL, NULL, 'unidade', NULL, 'Preparado'),
('Açaí Tigela', 'Tigela', 'M', 25.00, 5, NULL, 10, 'grama', NULL, 'Preparado');

INSERT INTO insumo (nome, estoque_minimo, unidade_medida, estoque, preco_custo)
VALUES 
('Morango', 10, 'kg', 1.5, 30.00),
('Banana', 15, 'kg', 5, 50.00),
('Granola', 20, 'kg', 2, 17.00),
('Copo 500ml', 30, 'unidade', 200, 10.00);

INSERT INTO produto_insumo (id_produto, id_insumo, unidade_medida, quantidade)
VALUES 
(1, 1, 'grama', '60'),  -- 60g de morango para Açaí Copo
(1, 2, 'grama', '100'),  -- 100g de banana para Açaí Copo
(3, 3, 'grama', '60'),   -- 60g de granola para Açaí Tigela
(1, 4, 'unidade', '1');   -- 1 copo para Açaí Copo 500ml

INSERT INTO pedido (cpf_cliente)
VALUES 
('12345678900'),
('98765432100');


INSERT INTO pedido_produto (id_pedido, id_produto, quantidade, adicionais, observacao, status, nome_cliente)
VALUES 
(1, 1, 1, 'Morango, Banana', NULL , 'finalizado', 'João'),    -- Açaí Copo
(1, 2, 2, NULL, NULL, 'finalizado', 'Maria'),                    -- Sorvete Casquinha
(2, 3, 1, 'Granola', 'Para viagem', 'finalizado', 'Mariana');     -- Açaí Tigela


INSERT INTO venda (total, status, id_pedido) 
VALUES 
    (26.00, 'finalizada', 1),
    (25.00, 'finalizada', 2);

INSERT INTO forma_pagamento (nome) 
VALUES 
    ('Dinheiro'),
    ('Cartão de Crédito'),
    ('Cartão de Débito'),
    ('Pix'),
    ('Vale Alimentação'),
    ('Vale Refeição');

INSERT INTO pagamento_venda (id_venda, id_pagamento, valor) 
VALUES 
    (1, 1, 15.00), 
    (1, 3, 11.00),  
    (2, 2, 25.00);  

INSERT INTO despesa (recorrencia, nome, valor) 
VALUES 
    ('Mensal', 'Aluguel', 1200.00);

-- consultas

-- insumos com estoque abaixo ou igual ao mínimo
CREATE VIEW estoque_insumos_criticos AS
SELECT 
    nome, 
    estoque, 
    estoque_minimo 
FROM insumo
WHERE estoque <= estoque_minimo;

-- consultas para gerar o relatório financeiro

-- gerar total de vendas diárias 

CREATE VIEW relatorio_vendas_diarias AS
SELECT 
    data_venda, 
    COUNT(*) AS total_vendas, 
    SUM(total) AS valor_vendido 
FROM venda
WHERE data_venda = CURDATE() AND status = 'finalizada'
GROUP BY data_venda;



-- gerar total de vendas diárias separadas por forma de pagamento 
SELECT COUNT(*) AS pv.total_vendas, fp.nome AS forma_pagamento, SUM (pv.total) AS valor_vendido FROM venda v
    JOIN pagamento_venda pv on pv.id_venda = v.id
    JOIN forma_pagamento fp on fp.id = pv.id_pagamento
WHERE v.data_venda = CURDATE() AND v.status = 'finalizada'
GROUP BY fp.nome;

-- gerar relatório de vendas diárias
SELECT
    id AS venda_id, data_venda, total AS valor_venda FROM venda
WHERE data_venda = CURDATE() AND status = 'finalizada';

-- gerar relatório de vendas diárias no débito
SELECT
    v.id AS venda_id, v.data_venda, v.total AS valor_venda FROM venda v 
    JOIN pagamento_venda pv on pv.id_venda = v.id
    JOIN forma_pagamento fp on fp.id = pv.id_pagamento
WHERE v.data_venda = CURDATE() AND v.status = 'finalizada' AND fp.nome = "Débito";

-- gerar relatório de vendas diárias no crédito
SELECT
    v.id AS venda_id, v.data_venda, v.total AS valor_venda FROM venda v 
    JOIN pagamento_venda pv on pv.id_venda = v.id
    JOIN forma_pagamento fp on fp.id = pv.id_pagamento
WHERE v.data_venda = CURDATE() AND v.status = 'finalizada' AND fp.nome = "Crédito";

-- gerar relatório de vendas diárias no dinheiro
SELECT
    v.id AS venda_id, v.data_venda, v.total AS valor_venda FROM venda v 
    JOIN pagamento_venda pv on pv.id_venda = v.id
    JOIN forma_pagamento fp on fp.id = pv.id_pagamento
WHERE v.data_venda = CURDATE() AND v.status = 'finalizada' AND fp.nome = "Dinheiro";

-- gerar relatório de vendas diárias no pix
SELECT
    v.id AS venda_id, v.data_venda, v.total AS valor_venda FROM venda v 
    JOIN pagamento_venda pv on pv.id_venda = v.id
    JOIN forma_pagamento fp on fp.id = pv.id_pagamento
WHERE v.data_venda = CURDATE() AND v.status = 'finalizada' AND fp.nome = "Pix";

-- gerar relatório de vendas semanais (semana começa no domingo)
SELECT 
    WEEK(data_venda, 1) AS semana, -- Usando 1 para que a semana comece no domingo
    YEAR(data_venda) AS ano, 
    MONTH(data_venda) AS mes,
    COUNT(*) AS total_vendas, 
    SUM(total) AS valor_vendido FROM venda
WHERE status = 'finalizada' AND MONTH(data_venda) = [NUMERO_DO_MES] AND YEAR(data_venda) = [ANO_DESEJADO]
GROUP BY ano, mes, semana ORDER BY ano, mes, semana;


-- gerar relatório de vendas mensais (retorna as vendas agrupadas por mes)
SELECT 
    YEAR(data_venda) AS ano, 
    MONTH(data_venda) AS mes,
    COUNT(*) AS total_vendas, 
    SUM(total) AS valor_vendido FROM venda
WHERE status = 'finalizada' AND YEAR(data_venda) = [ANO_DESEJADO]
GROUP BY ano, mes ORDER BY ano, mes;


-- gerar relatório de vendas anual (total anual do ano escolhido)
SELECT 
    YEAR(data_venda) AS ano, 
    COUNT(*) AS total_vendas, 
    SUM(total) AS valor_vendido FROM venda
WHERE status = 'finalizada' AND YEAR(data_venda) = [ANO_DESEJADO]
GROUP BY ano;

-- gerar relatório de vendas anual (total anual dos ultimos anos)
SELECT 
    YEAR(data_venda) AS ano, 
    COUNT(*) AS total_vendas, 
    SUM(total) AS valor_vendido FROM venda
WHERE status = 'finalizada'
GROUP BY ano GROUP BY ano DESC;
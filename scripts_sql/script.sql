CREATE DATABASE IF NOT EXISTS leilaocombustivel;
USE leilaocombustivel;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY perfil_nome_UN (nome)
);

INSERT INTO perfil (nome) VALUES ('ADMINISTRADOR'), ('COMUM');

-- DROP TABLE IF EXISTS tipo;
CREATE TABLE tipo (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY tipo_nome_UN (nome)
);

INSERT INTO tipo (nome) VALUES ('GERAL'), ('POSTO'), ('DISTRIBUIDOR');

-- DROP TABLE IF EXISTS estado;
CREATE TABLE estado (
  id int NOT NULL,
  sigla char(2) NOT NULL,
  nome varchar(20) NOT NULL,
  idcapital int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY estado_sigla_UN (sigla)
);

INSERT INTO estado (id, sigla, nome, idcapital) VALUES (1, 'AC','ACRE', 16), (2, 'AL','ALAGOAS', 69), (3, 'AP','AMAPÁ', 131), (4, 'AM','AMAZONAS', 178), (5, 'BA','BAHIA', 538), (6, 'CE','CEARÁ', 678), (7, 'DF','DISTRITO FEDERAL', 804), (8, 'ES','ESPIRITO SANTO', 882), (9, 'GO','GOIÁS', 977), (10,'MA','MARANHÃO', 1314), (11,'MS','MATO GROSSO DO SUL', 1365), (12,'MT','MATO GROSSO', 1461), (13,'MG','MINAS GERAIS', 1630), (14,'PA','PARÁ', 2436), (15,'PB','PARAÍBA', 2655), (16,'PR','PARANÁ', 2878), (17,'PE','PERNAMBUCO', 3315), (18,'PI','PIAUÍ', 3582), (19,'RJ','RIO DE JANEIRO', 3658), (20,'RN','RIO GRANDE DO NORTE', 3770), (21,'RS','RIO GRANDE DO SUL', 4174), (22,'RO','RONDÔNIA', 4382), (23,'RR','RORAIMA', 4400), (24,'SC','SANTA CATARINA', 4500), (25,'SP','SÃO PAULO', 5270), (26,'SE','SERGIPE', 5353), (27,'TO','TOCANTINS', 5514);

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  idtipo int NOT NULL,
  senha varchar(100) NOT NULL,
  token char(32) DEFAULT NULL,
  criacao datetime NOT NULL,
  telefone varchar(20) NOT NULL,
	endereco varchar(100) NOT NULL,
	cep varchar(15) NOT NULL,
	idcidade int NOT NULL,
  idestado int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY usuario_login_UN (login),
  KEY usuario_idperfil_FK_idx (idperfil),
  KEY usuario_idtipo_FK_idx (idtipo),
  KEY usuario_idcidade_FK_idx (idcidade),
  KEY usuario_idestado_FK_idx (idestado),
  CONSTRAINT usuario_idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT usuario_idtipo_FK FOREIGN KEY (idtipo) REFERENCES tipo (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT usuario_idcidade_FK FOREIGN KEY (idcidade) REFERENCES cidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT usuario_idestado_FK FOREIGN KEY (idestado) REFERENCES estado (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (login, nome, idperfil, senha, token, criacao) VALUES ('ADMIN', 'ADMINISTRADOR', 1, 'peTcC99vkvvLqGQL7mdhGuJZIvL2iMEqvCNvZw3475PJ:JVyo1Pg2HyDyw9aSOd3gNPT30KdEyiUYCjs7RUzSoYGN', NULL, NOW());

CREATE TABLE IF NOT EXISTS posto (
  id int NOT NULL,
  num_pedidos int NOT NULL,
  num_compras int NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_posto_usuario_id FOREIGN KEY (id) REFERENCES usuario (id) ON DELETE CASCADE ON UPDATE NO ACTION
)


CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_anu INT NOT NULL,
  data_pedido DATE NOT NULL,
  valortotal_pedido DOUBLE NOT NULL,
  id_posto INT NOT NULL,
  PRIMARY KEY (`id_pedido`))



-- -----------------------------------------------------
-- Table `mydb`.`posto`
-- -----------------------------------------------------



-- -----------------------------------------------------
-- Table `mydb`.`combustivel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS combustivel (
  id_comb INT NOT NULL,
  tipo_comb INT NOT NULL,
  desc_comb VARCHAR(45) NOT NULL,
  origem_comb VARCHAR(45) NULL,
  PRIMARY KEY (`id_comb`))



-- -----------------------------------------------------
-- Table `mydb`.`anuncio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS anuncio (
  id_anu INT NOT NULL,
  prazo_anu VARCHAR(45) NOT NULL,
  transporte_anu VARCHAR(45) NOT NULL,
  qtd_anu DOUBLE NOT NULL,
  id_dist VARCHAR(45) NOT NULL,
  data_anu DATE NULL,
  valor_anu DOUBLE NOT NULL,
  id_transp INT NOT NULL,
  id_comb INT NOT NULL,
  id_pedido INT NOT NULL,
  combustivel_id_comb INT NOT NULL,
  PRIMARY KEY (`id_anu`),
  INDEX fk_anuncio_pedido1_idx (`id_pedido` ASC) VISIBLE,
  INDEX fk_anuncio_combustivel1_idx (`combustivel_id_comb` ASC) VISIBLE,
  CONSTRAINT fk_anuncio_pedido1
    FOREIGN KEY (`id_pedido`)
    REFERENCES pedido (`id_pedido`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_anuncio_combustivel1
    FOREIGN KEY (`combustivel_id_comb`)
    REFERENCES combustivel (`id_comb`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)



-- -----------------------------------------------------
-- Table `mydb`.`distribuidor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS distribuidor (
  id_dist INT NOT NULL AUTO_INCREMENT,
  anuncios_dist INT NULL,
  vestas_dist INT NULL,
  cnpj_dist VARCHAR(45) NOT NULL,
  id_cad INT NOT NULL,
  id_anu INT NULL,
  end_dist VARCHAR(45) NOT NULL,
  nome_dist VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_dist`),
  INDEX fk_distribuidor_anuncio1_idx (`id_anu` ASC) VISIBLE,
  CONSTRAINT fk_distribuidor_anuncio1
    FOREIGN KEY (`id_anu`)
    REFERENCES anuncio (`id_anu`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)



-- -----------------------------------------------------
-- Table `mydb`.`transportadora`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS transportadora (
  id_transp INT NOT NULL AUTO_INCREMENT,
  nome_tansp VARCHAR(45) NOT NULL,
  anuncio_id_anu INT NOT NULL,
  PRIMARY KEY (`id_transp`),
  INDEX fk_transportadora_anuncio1_idx (`anuncio_id_anu` ASC) VISIBLE,
  CONSTRAINT fk_transportadora_anuncio1
    FOREIGN KEY (`anuncio_id_anu`)
    REFERENCES anuncio (`id_anu`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)


-- -----------------------------------------------------
-- Table `mydb`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarioregular (
  id_cad INT NOT NULL AUTO_INCREMENT,
  email_cad VARCHAR(45) NOT NULL,
  senha_cad VARCHAR(100) NOT NULL,
  cel_cad VARCHAR(45) NOT NULL,
  tipo_cad INT NOT NULL,
  id_posto INT NOT NULL,
  id_dist INT NOT NULL,
  criacao DATE NOT NULL,
  token CHAR(32) NOT NULL,
  PRIMARY KEY (`id_cad`),
  INDEX fk_usuario_id_postox (`id_posto` ASC) VISIBLE,
  INDEX fk_usuario_distribuidor1_idx (`id_dist` ASC) VISIBLE,
  CONSTRAINT fk_usuario_posto
    FOREIGN KEY (`id_posto`)
    REFERENCES posto (`id_posto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_usuario_distribuidor1
    FOREIGN KEY (`id_dist`)
    REFERENCES distribuidor (`id_dist`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)



-- -----------------------------------------------------
-- Table `mydb`.`mediapreco`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mediapreco (
  id_mediap INT NOT NULL AUTO_INCREMENT,
  id_comb INT NOT NULL,
  precoa_mediap DOUBLE NOT NULL,
  semanal_mediap DOUBLE NOT NULL,
  mensal_mediap DOUBLE NOT NULL,
  anual_mediap DOUBLE NOT NULL,
  PRIMARY KEY (`id_mediap`))



-- -----------------------------------------------------
-- Table `mydb`.`notaf`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS notaf (
  id_nota INT NOT NULL,
  id_pedido INT NOT NULL,
  data_nota DATE NOT NULL,
  numboleto_nota TEXT NOT NULL,
  PRIMARY KEY (`id_nota`),
  INDEX `fk_notaf_pedido1_idx` (`id_pedido` ASC) VISIBLE,
  CONSTRAINT `fk_notaf_pedido1`
    FOREIGN KEY (`id_pedido`)
    REFERENCES pedido (`id_pedido`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)



-- -----------------------------------------------------
-- Table `mydb`.`docdistribuidora`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS docdistribuidora (
  id_doc INT NOT NULL,
  pathdoc VARCHAR(255) NOT NULL,
  id_dist INT NOT NULL,
  PRIMARY KEY (`id_doc`),
  INDEX `fk_docdistribuidora_distribuidor1_idx` (`id_dist` ASC) VISIBLE,
  CONSTRAINT `fk_docdistribuidora_distribuidor1`
    FOREIGN KEY (`id_dist`)
    REFERENCES distribuidor (`id_dist`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)



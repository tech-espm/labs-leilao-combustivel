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


--COLOCAR SCRIPT DA CIDADE AQUI

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  idtipo int NOT NULL,
  senha varchar(100) NOT NULL,
  token char(32) DEFAULT NULL,
  telefone varchar(20) NOT NULL,
  endereco varchar(100) NOT NULL,
  cep varchar(15) NOT NULL,
  idcidade int NOT NULL,
  idestado int NOT NULL,
  criacao datetime NOT NULL,
  cnpj varchar(18) NOT NULL,
  num_anuncios int,
  num_vendas int,
  num_pedidos int,
  num_compras int,
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

INSERT INTO usuario (login, nome, idperfil, idtipo, senha, token, criacao, telefone, endereco, cep, idcidade, idestado, cnpj) VALUES ('ADMIN', 'ADMINISTRADOR', 1, 1, 'peTcC99vkvvLqGQL7mdhGuJZIvL2iMEqvCNvZw3475PJ:JVyo1Pg2HyDyw9aSOd3gNPT30KdEyiUYCjs7RUzSoYGN', NULL, NOW(), '', '', '', 5270, 25, '');


CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_anu INT NOT NULL,
  id_usuario INT NOT NULL,
  data_pedido DATE NOT NULL,
  valortotal_pedido DOUBLE NOT NULL,
  PRIMARY KEY (`id_pedido`),
  CONSTRAINT pedido_idusuario_FK FOREIGN KEY (id_usuario) REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT
  );

-- -----------------------------------------------------
-- Table `mydb`.`combustivel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS combustivel (
  id_comb INT NOT NULL,
  tipo_comb INT NOT NULL,
  desc_comb VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_comb`));

insert into combustivel(id_comb, tipo_comb, desc_comb) values('1', '1', 'Gasolina Comum');
('1', '2', 'Gasolina Adtivada'),
('1', '3', 'Gasolina Premium'),
('2', '1', 'Alcol Comum'),
('2', '2', 'Alcol Aditivado'),
('3', '1', 'Disel S10'),
('3', '2', 'Disel S500');

CREATE TABLE IF NOT EXISTS rescomb(
  id_usuario INT NOT NULL,
  id_comb INT NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  FOREIGN KEY (id_comb) REFERENCES combustivel(id_comb)
);

-- -----------------------------------------------------
-- Table `mydb`.`anuncio`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS anuncio (
  id_anu INT NOT NULL AUTO_INCREMENT,
  prazo_anu VARCHAR(45) NOT NULL,
  qtd_anu DOUBLE NOT NULL,
  id_usuario INT NOT NULL,
  data_anu DATE NULL,
  valor_anu DOUBLE NOT NULL,
  id_transp INT NOT NULL,
  id_comb INT NOT NULL,
  PRIMARY KEY (`id_anu`),
  INDEX fk_anuncio_combustivel1_idx (`combustivel_id_comb` ASC) VISIBLE,
    CONSTRAINT FK_tranportadora FOREIGN KEY (id_transp)
    REFERENCES transportadora(id_transp)
    CONSTRAINT fk_anuncio_combustivel1
    FOREIGN KEY (`id_comb`)
    REFERENCES combustivel (`id_comb`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id));





-- -----------------------------------------------------
-- Table `mydb`.`transportadora`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS transportadora (
  id_transp INT NOT NULL AUTO_INCREMENT,
  nome_transp VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_transp`)); 

  insert into transportadora(id_transp, nome_transp)values 
  (1,"FOB"),(2,"CIF");

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
  PRIMARY KEY (`id_mediap`));



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
    ON UPDATE NO ACTION);



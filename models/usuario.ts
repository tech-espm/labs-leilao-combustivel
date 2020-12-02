import { randomBytes } from "crypto";
import express = require("express");
// https://www.npmjs.com/package/lru-cache
import lru = require("lru-cache");
import Sql = require("../infra/sql");
import Combustivel = require("./combustivel");
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import intToHex = require("../utils/intToHex");
import emailValido = require("../utils/emailValido");

export = class Usuario {

	public static readonly IdUsuarioAdmin = 1;

	public static readonly IdPerfilAdmin = 1;
	public static readonly IdPerfilComum = 2;

	public static readonly IdTipoGeral = 1;
	public static readonly IdTipoPosto = 2;
	public static readonly IdTipoDistribuidor = 3;

	public id: number;
	public login: string;
	public nome: string;
	public idperfil: number;
	public idtipo: number; 
	public senha: string; 
	public telefone: string;
	public endereco: string;
	public cep: string;
	public idcidade: number;
	public idestado: number;
	public criacao: string; 
	public cnpj: string; 
	public num_anuncios: number; 
	public num_vendas: number; 
	public num_pedidos: number; 
	public num_compras: number; 
	public combustiveis: Combustivel[]; 
	// Utilizados apenas através do cookie
	public superadmin: boolean;

	// Não estamos utilizando Usuario.cookie como middleware, porque existem muitas requests
	// que não precisam validar o usuário logado, e agora, é assíncrono...
	// http://expressjs.com/pt-br/guide/writing-middleware.html
	//public static cookie(req: express.Request, res: express.Response, next: Function): void {
	public static async cookie(req: express.Request, res: express.Response = null, admin: boolean = false): Promise<Usuario> {
		let cookieStr = req.cookies[appsettings.cookie] as string;
		if (!cookieStr || cookieStr.length !== 48) {
			if (res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return null;
		} else {
			let id = parseInt(cookieStr.substr(0, 8), 16) ^ appsettings.usuarioHashId;
			let usuario: Usuario = null;

			await Sql.conectar(async (sql: Sql) => {
				let rows = await sql.query("select id, login, nome, idperfil, idtipo, token from usuario where id = ?", [id]);
				let row;

				if (!rows || !rows.length || !(row = rows[0]))
					return;

				let token = cookieStr.substring(16);

				if (!row.token || token !== (row.token as string))
					return;

				let u = new Usuario();
				u.id = id;
				u.login = row.login as string;
				u.nome = row.nome as string;
				u.idperfil = row.idperfil as number;
				u.idtipo = row.idtipo as number;
				u.superadmin = (u.idperfil === Usuario.IdPerfilAdmin && u.idtipo === Usuario.IdTipoGeral);

				usuario = u;
			});

			if (admin && usuario && usuario.idperfil !== Usuario.IdPerfilAdmin)
				usuario = null;
			if (!usuario && res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return usuario;
		}
	}

	private static gerarTokenCookie(id: number): [string, string] {
		let idStr = intToHex(id ^ appsettings.usuarioHashId);
		let idExtra = intToHex(0);
		let token = randomBytes(16).toString("hex");
		let cookieStr = idStr + idExtra + token;
		return [token, cookieStr];
	}

	public static async efetuarLogin(login: string, senha: string, res: express.Response): Promise<[string, Usuario]> {
		if (!login || !senha)
			return ["Usuário ou senha inválidos", null];

		let r: string = null;
		let u: Usuario = null;

		await Sql.conectar(async (sql: Sql) => {
			login = login.normalize().trim().toUpperCase();

			let rows = await sql.query("select id, nome, idperfil, idtipo, senha from usuario where login = ?", [login]);
			let row;
			let ok: boolean;

			if (!rows || !rows.length || !(row = rows[0]) || !(ok = await GeradorHash.validarSenha(senha.normalize(), row.senha))) {
				r = "Usuário ou senha inválidos";
				return;
			}

			let [token, cookieStr] = Usuario.gerarTokenCookie(row.id);

			await sql.query("update usuario set token = ? where id = ?", [token, row.id]);

			u = new Usuario();
			u.id = row.id;
			u.login = login;
			u.nome = row.nome as string;
			u.idperfil = row.idperfil as number;
			u.idtipo = row.idtipo as number;
			u.superadmin = (u.idperfil === Usuario.IdPerfilAdmin && u.idtipo === Usuario.IdTipoGeral);

			res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});

		return [r, u];
	}

	public async efetuarLogout(res: express.Response): Promise<void> {
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update usuario set token = null where id = ?", [this.id]);

			res.cookie(appsettings.cookie, "", { expires: new Date(0), httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});
	}

	public async alterarPerfil(res: express.Response, nome: string, senhaAtual: string, novaSenha: string): Promise<string> {
		nome = (nome || "").normalize().trim().toUpperCase();
		if (nome.length < 3 || nome.length > 100)
			return "Nome inválido";

		if (!!senhaAtual !== !!novaSenha || (novaSenha && novaSenha.length > 40))
			return "Senha inválida";

		let r: string = null;

		await Sql.conectar(async (sql: Sql) => {
			if (senhaAtual) {
				let hash = await sql.scalar("select senha from usuario where id = ?", [this.id]) as string;
				if (!await GeradorHash.validarSenha(senhaAtual.normalize(), hash)) {
					r = "Senha atual não confere";
					return;
				}

				hash = await GeradorHash.criarHash(novaSenha.normalize());

				let [token, cookieStr] = Usuario.gerarTokenCookie(this.id);

				await sql.query("update usuario set nome = ?, senha = ?, token = ? where id = ?", [nome, hash, token, this.id]);

				this.nome = nome;

				res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });
			} else {
				await sql.query("update usuario set nome = ? where id = ?", [nome, this.id]);

				this.nome = nome;
			}
		});

		return r;
	}

	protected static validarUsuario(u: Usuario): string {
		u.id = parseInt(u.id as any);

		u.login = (u.login || "").normalize().trim().toUpperCase();
		if (u.login.length < 3 || u.login.length > 100 || !emailValido(u.login))
			return "Login inválido";

		u.nome = (u.nome || "").normalize().trim().toUpperCase();
		if (u.nome.length < 3 || u.nome.length > 100)
			return "Nome inválido";

		u.idperfil = parseInt(u.idperfil as any);
		if (isNaN(u.idperfil) || u.idperfil < Usuario.IdPerfilAdmin || u.idperfil > Usuario.IdPerfilComum)
			return "Perfil inválido";

		u.idtipo = parseInt(u.idtipo as any);
		if (isNaN(u.idtipo) || u.idtipo < Usuario.IdTipoGeral || u.idperfil > Usuario.IdTipoDistribuidor)
			return "Tipo inválido";

		u.telefone = (u.telefone || "").normalize().trim().toUpperCase();
		if (u.telefone.length < 3 || u.telefone.length > 20)
			return "Telefone inválido";

		u.endereco = (u.endereco || "").normalize().trim().toUpperCase();
		if (u.endereco.length < 3 || u.endereco.length > 100)
			return "Telefone inválido";

		u.cep = (u.cep || "").normalize().trim().toUpperCase();
		if (u.cep.length < 9 || u.cep.length > 15)
			return "CEP inválido";

		u.idcidade = parseInt(u.idcidade as any);
		u.idestado = parseInt(u.idestado as any);

		return null;
	}

	public static async listarGeral(): Promise<Usuario[]> {
		let lista: Usuario[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, t.nome tipo, u.telefone, u.cnpj, u.endereco, u.cep, c.nome cidade, e.sigla estado, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil inner join tipo t on t.id = u.idtipo inner join cidade c on c.id = u.idcidade inner join estado e on e.id = u.idestado") as Usuario[];
		});

		return (lista || []);
	}

	public static async obterGeral(id: number): Promise<Usuario> {
		let usuario: Usuario = null;

		await Sql.conectar(async (sql: Sql) => {
			const lista = await sql.query("select id, login, nome, idperfil, idtipo, senha, telefone, cnpj, endereco, cep, idcidade, idestado, date_format(criacao, '%d/%m/%Y') criacao from usuario where id = ?", [id]) as Usuario[];

			if (lista && lista[0])
				usuario = lista[0];
		});

		if (usuario)
			usuario.combustiveis = await Combustivel.listarDeUsuario(usuario.id);

		return usuario;
	}

	public static async criarGeral(u: Usuario): Promise<string> {
		let res: string;
		if ((res = Usuario.validarUsuario(u)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			res = await Usuario.criarUsuario(sql, u);
		});

		return res;
	}

	public static async alterarGeral(u: Usuario): Promise<string> {
		let res: string;
		if ((res = Usuario.validarUsuario(u)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			res = await Usuario.alterarUsuario(sql, u);
		});

		return res;
	}

	protected static async criarUsuario(sql: Sql, u: Usuario): Promise<string> {
		let res: string = null;

		u.login = (u.login || "").normalize().trim().toUpperCase();
		if (u.login.length < 3 || u.login.length > 100)
			return "Login inválido";

		try {		//FALTA ATRIBUTO CNPJ, POSSUIR CAMINHÃO, CONVENIO, EXTRATO BANCARIO, CONTRATO SOCIAL, RAZÃO SOCIAL
			await sql.query("insert into usuario (login, nome, idperfil, idtipo, senha, telefone, cnpj, endereco, cep, idcidade, idestado, criacao) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())", [u.login, u.nome, u.idperfil, u.idtipo, appsettings.usuarioHashSenhaPadrao, u.telefone, u.cnpj, u.endereco, u.cep, u.idcidade, u.idestado]);
			u.id = await sql.scalar("select last_insert_id()") as number;
		} catch (e) {
			if (e.code) {
				switch (e.code) {
					case "ER_DUP_ENTRY":
						res = `O login ${u.login} já está em uso`;
						break;
					case "ER_NO_REFERENCED_ROW":
					case "ER_NO_REFERENCED_ROW_2":
						res = "Perfil, tipo, cidade ou estado não encontrado";
						break;
					default:
						throw e;
				}
			} else {
				throw e;
			}
		}

		return res;
	}

	protected static async alterarUsuario(sql: Sql, u: Usuario): Promise<string> {
		if (u.id === Usuario.IdUsuarioAdmin)
			return "Não é possível editar o usuário administrador principal";

		await sql.query("update usuario set nome = ?, idperfil = ?, telefone = ?, endereco = ?, cep = ?, idcidade = ?, idestado = ? where id = ?", [u.nome, u.idperfil, u.telefone, u.endereco, u.cep, u.idcidade, u.idestado, u.id]);

		return null;
	}

	public static async excluir(id: number): Promise<string> {
		if (id === Usuario.IdUsuarioAdmin)
			return "Não é possível excluir o usuário administrador principal";

		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from usuario where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

	public static async redefinirSenha(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			let login = await sql.scalar("select login from usuario where id = ?", [id]) as string;
			if (!login) {
				res = "0";
			} else {
				await sql.query("update usuario set token = null, senha = ? where id = ?", [appsettings.usuarioHashSenhaPadrao, id]);
				res = sql.linhasAfetadas.toString();
			}
		});

		return res;
	}
}

import { randomBytes } from "crypto";
import express = require("express");
// https://www.npmjs.com/package/lru-cache
import lru = require("lru-cache");
import Sql = require("../infra/sql");
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import Usuario = require("./usuario");

export = class Posto extends Usuario {

	public num_pedidos: number;
	public num_compras: number;

	private static validar(p: Posto): string {
		const res = Usuario.validarUsuario(p);
		if (res)
			return res;

		// @@@ validar os campos próprios do posto
		// (por hora, nenhum)

		return null;
	}

	public static async listar(): Promise<Posto[]> {
		let lista: Posto[] = null;

		await Sql.conectar(async (sql: Sql) => {
			// @@@ ajustar query com os campos novos do usuário e do posto
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Posto[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Posto> {
		let lista: Posto[] = null;

		await Sql.conectar(async (sql: Sql) => {
			// @@@ ajustar query com os campos novos do usuário e do posto
			lista = await sql.query("select id, login, nome, idperfil, date_format(criacao, '%d/%m/%Y') criacao from usuario where id = ?", [id]) as Posto[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(p: Posto): Promise<string> {
		let res: string;
		if ((res = Posto.validar(p)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			sql.beginTransaction();

			res = await Usuario.criarUsuario(sql, p);
			if (res)
				return;

			await sql.query("insert into posto (id, num_pedidos, num_compras) values (?, 0, 0)", [p.id]);

			await sql.commit();
		});

		return res;
	}

	public static async alterar(p: Posto): Promise<string> {
		let res: string;
		if ((res = Posto.validar(p)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			sql.beginTransaction();

			res = await Usuario.alterarUsuario(sql, p);
			if (res)
				return;

			// @@@ o dia que tiver campos próprios para alterar
			//await sql.query("update posto ...", [p.id]);

			await sql.commit();
		});

		return res;
	}
}

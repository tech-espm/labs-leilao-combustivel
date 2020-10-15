import { randomBytes } from "crypto";
import express = require("express");
// https://www.npmjs.com/package/lru-cache
import lru = require("lru-cache");
import Sql = require("../infra/sql");
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import Usuario = require("./usuario");

export = class Distribuidor extends Usuario {

	public cnpj: string;
	public num_anuncios: number;
	public num_vendas: number;

	private static validar(d: Distribuidor): string {
		const res = Usuario.validarUsuario(d);
		if (res)
			return res;

		d.cnpj = (d.cnpj || "").normalize().trim();
		if (d.cnpj.length !== 18)
			return "CNPJ inválido";

		return null;
	}

	public static async listar(): Promise<Distribuidor[]> {
		let lista: Distribuidor[] = null;

		await Sql.conectar(async (sql: Sql) => {
			// @@@ ajustar query com os campos novos do usuário e do posto
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Distribuidor[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Distribuidor> {
		let lista: Distribuidor[] = null;

		await Sql.conectar(async (sql: Sql) => {
			// @@@ ajustar query com os campos novos do usuário e do posto
			lista = await sql.query("select id, login, nome, idperfil, date_format(criacao, '%d/%m/%Y') criacao from usuario where id = ?", [id]) as Distribuidor[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(d: Distribuidor): Promise<string> {
		let res: string;
		if ((res = Distribuidor.validar(d)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			sql.beginTransaction();

			res = await Usuario.criarUsuario(sql, d);
			if (res)
				return;

			await sql.query("insert into distribuidor (id, cnpj, num_anuncios, num_vendas) values (?, ?, 0, 0)", [d.id, d.cnpj]);

			await sql.commit();
		});

		return res;
	}

	public static async alterar(d: Distribuidor): Promise<string> {
		let res: string;
		if ((res = Distribuidor.validar(d)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			sql.beginTransaction();

			res = await Usuario.alterarUsuario(sql, d);
			if (res)
				return;

			await sql.query("update distribuidor set cnpj = ? where id = ?", [d.cnpj, d.id]);

			await sql.commit();
		});

		return res;
	}
}

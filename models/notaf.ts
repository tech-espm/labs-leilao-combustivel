import { randomBytes } from "crypto";
import express = require("express");
// https://www.npmjs.com/package/lru-cache
import lru = require("lru-cache");
import Sql = require("../infra/sql");
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import intToHex = require("../utils/intToHex");

export = class Notaf {

	private static readonly IdAdmin = 1;
	private static readonly IdPerfilAdmin = 1;

	public id_nota: number;
	public id_pedido: number;
	public data_nota: Date;
	public numboleto_nota: string;
	

	
    //Listar Nota Fiscal? Perguntar 
	public static async listar(): Promise<Notaf[]> {
		let lista: Notaf[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Notaf[];
		});

		return (lista || []);
	}

	public static async obter(id_nota: number): Promise<Notaf> {
		let lista: Notaf[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id_nota, id_pedido, data_nota, numboleto_nota from notaf where id_nota = ?", [id_nota]) as Notaf[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(sql: Sql, n: Notaf): Promise<void> {
			await sql.query("insert into notaf (id_nota, id_pedido, data_nota, numboleto_nota) values (?, ?, ?, ?)", [n.id_nota, n.id_pedido, n.data_nota, n.numboleto_nota]);
        	
	}

	public static async editar(n: Notaf): Promise<string> {
		let res: string;
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update notaf set id_pedido = ?, data_nota = ?, numboleto_nota = ? where id_nota = ?", [n.id_pedido, n.data_nota, n.numboleto_nota, n.id_nota]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

	public static async excluir(id_nota: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from notaf where id_nota = ?", [id_nota]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

}

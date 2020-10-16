import { randomBytes } from "crypto";
import express = require("express");
// https://www.npmjs.com/package/lru-cache
import lru = require("lru-cache");
import Sql = require("../infra/sql");
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import intToHex = require("../utils/intToHex");

export = class Pedido {

	private static readonly IdAdmin = 1;
	private static readonly IdPerfilAdmin = 1;

	public id_pedido: number;
	public id_anu: number;
	public data_pedido: Date;
    public valortotal_pedido: number;
    public id_posto: number;
	
	
    //Listar Nota Fiscal? Perguntar 
	public static async listar(): Promise<Pedido[]> {
		let lista: Pedido[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Pedido[];
		});

		return (lista || []);
	}

	public static async obter(id_nota: number): Promise<Pedido> {
		let lista: Notaf[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id_nota, id_pedido, data_nota, numboleto_nota from notaf where id_nota = ?", [id_nota]) as Notaf[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(sql: Sql, pe: Pedido): Promise<void> {
			await sql.query("insert into pedido (id_pedido, id_anu, data_pedido, valortotal_pedido, id_posto) values (?, ?, ?, ?,?)", [pe.id_pedido, pe.id_anu, pe.data_pedido, pe.valortotal_pedido, pe.id_posto]);
        	
	}

	public static async editar(pe: Pedido): Promise<string> {
		let res: string;
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update pedido set id_anu = ?, data_pedido = ?, valortotal_pedido = ?, id_posto = ?  where id_pedido = ?", [pe.id_anu, pe.data_pedido, pe.valortotal_pedido, pe.id_posto]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

	public static async excluir(id_nota: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from pedido where id_pedido = ?", [id_nota]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

}
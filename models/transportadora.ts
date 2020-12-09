import Sql = require("../infra/sql");

export = class Transportadora {
	public id_transp: number;
	public nome_transp: string;
	

	private static validar(a: Transportadora): string {
		a.nome_transp = (a.nome_transp || "").normalize().trim();
		if (a.nome_transp.length < 3 || a.nome_transp.length > 100)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Transportadora[]> {
		let lista: Transportadora[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id_transp, nome_transp from transportadora order by nome_transp asc")) as Transportadora[];
		});

		return lista || [];
	}

	public static async obter(id_transp: number): Promise<Transportadora> {
		let lista: Transportadora[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select select id_transp, nome_transp from transportadora where id_transp = ?", [id_transp])) as Transportadora[];
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(a: Transportadora): Promise<string> {
		let res: string;
		if ((res = Transportadora.validar(a)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into transportadora (nome_transp) values (?)", [a.nome_transp]);
			} catch (e) {
			if (e.code && e.code === "ER_DUP_ENTRY")
				res = `O assunto ${a.nome_transp} já existe`;
			else
				throw e;
			}
		});

		return res;
	}

	public static async alterar(a: Transportadora): Promise<string> {
		let res: string;
		if ((res = Transportadora.validar(a)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update transportadora set nome_transp = ? where id_transp = ?", [a.nome_transp, a.id_transp]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `A transportadora ${a.nome_transp} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async excluir(id_transp: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from transportadora where id_transp = ?", [id_transp]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};

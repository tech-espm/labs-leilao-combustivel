import Sql = require("../infra/sql");

export = class Combustivel {
	public id_comb: number;
	public desc_comb: string;
	

	private static validar(c: Combustivel): string {
		c.desc_comb = (c.desc_comb || "").normalize().trim();
		if (c.desc_comb.length < 3 || c.desc_comb.length > 100)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Combustivel[]> {
		let lista: Combustivel[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id_comb, desc_comb from combustivel order by desc_comb asc")) as Combustivel[];
		});

		return lista || [];
	}

	public static async obter(id_comb: number): Promise<Combustivel> {
		let lista: Combustivel[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select select id_comb, desc_comb from combustivel where id_comb = ?", [id_comb])) as Combustivel[];
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(c: Combustivel): Promise<string> {
		let res: string;
		if ((res = Combustivel.validar(c)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into combustivel (desc_comb) values (?)", [c.desc_comb]);
			} catch (e) {
			if (e.code && e.code === "ER_DUP_ENTRY")
				res = `O combustivel ${c.desc_comb} já existe`;
			else
				throw e;
			}
		});

		return res;
	}

	public static async alterar(c: Combustivel): Promise<string> {
		let res: string;
		if ((res = Combustivel.validar(c)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update combustivel set desc_comb = ? where id_comb = ?", [c.desc_comb, c.id_comb]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `A transportadora ${c.desc_comb} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async excluir(id_comb: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from combustivel where id_comb = ?", [id_comb]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};

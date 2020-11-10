import Sql = require("../infra/sql");

export = class Tipo {
	public id: number;
	public nome: string;

	private static validar(p: Tipo): string {
		p.nome = (p.nome || "").normalize().trim();
		if (p.nome.length < 3 || p.nome.length > 50)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Tipo[]> {
		let lista: Tipo[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome from tipo order by nome asc")) as Tipo[];
		});

		return lista || [];
	}

	public static async obter(id: number): Promise<Tipo> {
		let lista: Tipo[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome from tipo where id = ?", [id])) as Tipo[];
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(t: Tipo): Promise<string> {
		let res: string;
		if ((res = Tipo.validar(t)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into tipo (nome) values (?)", [t.nome]);
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `O tipo ${t.nome} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async alterar(p: Tipo): Promise<string> {
		let res: string;
		if ((res = Tipo.validar(p)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update tipo set nome = ? where id = ?", [p.nome, p.id]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `O tipo ${p.nome} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from tipo where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};

import Sql = require("../infra/sql");

export = class Origem {
	public id_origem: number;
	public desc_origem: string;
	

	private static validar(a: Origem): string {
		a.desc_origem = (a.desc_origem || "").normalize().trim();
		if (a.desc_origem.length < 3 || a.desc_origem.length > 100)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Origem[]> {
		let lista: Origem[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id_origem, desc_origem from origem order by desc_origem asc")) as Origem[];
		});

		return lista || [];
	}

	public static async obter(id_origem: number): Promise<Origem> {
		let lista: Origem[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select select id_origem, desc_origem from origem where id_origem = ?", [id_origem])) as Origem[];
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(a: Origem): Promise<string> {
		let res: string;
		if ((res = Origem.validar(a)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into origem (desc_origem) values (?)", [a.desc_origem]);
			} catch (e) {
			if (e.code && e.code === "ER_DUP_ENTRY")
				res = `O assunto ${a.desc_origem} já existe`;
			else
				throw e;
			}
		});

		return res;
	}

	public static async alterar(a: Origem): Promise<string> {
		let res: string;
		if ((res = Origem.validar(a)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update origem set desc_origem = ? where desc_origem = ?", [a.desc_origem, a.id_origem]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `A Origem ${a.desc_origem} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async excluir(id_origem: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from origem where id_origem = ?", [id_origem]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};

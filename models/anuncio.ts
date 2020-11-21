import Sql = require("../infra/sql");

export = class Anuncio {


	public id_anu: number;
	public prazo_anu: string;
    public qtd_anu: number;
    public id_usuario: number; 
	public data_anu: Date; 
    public valor_anu: number; 
    public id_transp: number; 
    public id_comb: number; 
  


    //Listar Nota Fiscal? Perguntar 
	public static async listar(): Promise<Anuncio[]> {
		let lista: Anuncio[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Anuncio[];
		});

		return (lista || []);
	}

	public static async obter(id_anu: number): Promise<Anuncio> {
		let lista: Anuncio[] = null;
		
		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id_anu, prazo_anu, qtd_anu, data_anu, valor_anu, id_transp, id_comb, id_pedido from anuncio where id_anu = ?", [id_anu]) as Anuncio[];
		});

		return ((lista && lista[0]) || null);
	}
	//O QUE VOLTA NO RETURN? 
	
	public static async criar(a: Anuncio): Promise<string> { 
		let res: string;
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("insert into anuncio (prazo_anu, qtd_anu, id_usuario, data_anu, valor_anu, id_transp, id_comb) values (?, ?, ?,?,?,?,?,?,?)", [a.prazo_anu, a.qtd_anu, a.id_usuario, a.data_anu, a.valor_anu, a.id_transp, a.id_comb]);
			res = sql.linhasAfetadas.toString();
		});
		
		return res;
	}

	public static async editar(a: Anuncio): Promise<string> {
		let res: string;
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update anuncio set prazo_anu= ?, qtd_anu = ?, data_anu = ?, valor_anu = ?  where id_anu = ?", [a.prazo_anu, a.qtd_anu, a.data_anu, a.valor_anu]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

	public static async excluir(id_anu: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from anuncio where id_anu = ?", [id_anu]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}





}

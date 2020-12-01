import Sql = require("../infra/sql");

export = class Pedido {

	private static readonly IdAdmin = 1;
	private static readonly IdPerfilAdmin = 1;

	public id_pedido: number;
	public id_anu: number;
	public data_pedido: Date;
	public valortotal_pedido: number; 
	public id_usuario: number;

	
	
    //Listar Nota Fiscal? Perguntar 
	public static async listar(id_usuario: number): Promise<Pedido[]> {
		let lista: Pedido[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select pe.id_pedido,a.id_anu, date_format(pe.data_pedido, '%d/%m/%Y') data_pedido, pe.valortotal_pedido from pedido pe inner join anuncio a on a.id_anu = a.id_anu where a.id_usuario = ? order by pe.id_pedido asc" , [id_usuario])) as Pedido[];
		});

		return (lista || []);
	}

	public static async obter(id_nota: number): Promise<Pedido> {
		let lista: Pedido[] = null;
		
		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id_nota, id_pedido, data_nota, numboleto_nota from notaf where id_nota = ?", [id_nota]) as Pedido[];
		});

		return ((lista && lista[0]) || null);
	}
	//O QUE VOLTA NO RETURN? 
	
	public static async criar(pe: Pedido): Promise<string> { 
		let res: string;
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("insert into pedido (id_anu, data_pedido, valortotal_pedido, id_usuario) values (?, ?, ?, ?)", [ pe.id_anu, pe.data_pedido, pe.valortotal_pedido, pe.id_usuario]);
			res = sql.linhasAfetadas.toString(); 
		});
		
		return res;
	}

	public static async alterar(pe: Pedido): Promise<string> {
		let res: string;
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update pedido set data_pedido = ?, valortotal_pedido = ?  where id_pedido = ?", [ pe.data_pedido, pe.valortotal_pedido]);
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


	//CRIAR FUNÇÃO COMPRA 


}

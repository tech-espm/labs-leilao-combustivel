import Sql = require("../infra/sql");

export = class Pedido {

	private static readonly IdAdmin = 1;
	private static readonly IdPerfilAdmin = 1;

	public id_pedido: number;
	public id_anu: number; 
	public qntd_pedido: number; 
	public data_pedido: string;
	public valortotal_pedido: number; 
	public id_usuario: number;

	
	private static validar(pe: Pedido): string {
		if (!pe)
			return "Pedido inválido";

		pe.id_pedido = parseInt(pe.id_pedido as any);



		if ((typeof pe.valortotal_pedido) === "string") {
			pe.valortotal_pedido = parseFloat((pe.valortotal_pedido as any).normalize().replace(/\./g, "").replace(",", "."));
		} else {				
			pe.valortotal_pedido = parseFloat(pe.valortotal_pedido as any);
			}
		if (isNaN(pe.valortotal_pedido) || pe.valortotal_pedido < 0)
			return "Valor inválido";
			
		if ((typeof pe.qntd_pedido) === "string") {
			pe.qntd_pedido = parseFloat((pe.qntd_pedido as any).normalize().replace(/\./g, "").replace(",", "."));
		} else {				
			pe.qntd_pedido = parseFloat(pe.qntd_pedido as any);
			}
		if (isNaN(pe.qntd_pedido) || pe.qntd_pedido < 0)
			return "Quantidade inválida";


		pe.id_anu = parseInt(pe.id_anu as any);
		if (isNaN(pe.id_anu))
			return "Anúncio inválido"; 


		return null;
	}
    //Listar Nota Fiscal? Perguntar 
	public static async listar(id_usuario: number): Promise<Pedido[]> {
		let lista: Pedido[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select pe.id_pedido, pe.id_anu, pe.qntd_pedido, c.desc_comb, o.desc_origem, u.nome, date_format(pe.data_pedido, '%d/%m/%Y') data_pedido, pe.valortotal_pedido from pedido pe inner join anuncio a on a.id_anu = pe.id_anu inner join combustivel c on c.id_comb = a.id_comb inner join origem o on o.id_origem = a.id_origem inner join usuario u on u.id = a.id_usuario where pe.id_usuario = ? order by pe.id_pedido asc" , [id_usuario])) as Pedido[];
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
	
	
	public static async criar(pe: Pedido): Promise<string> { 
		let res: string;
		await Sql.conectar(async (sql: Sql) => { //data_pedido não é criado para agora mas fiz para o protótipo
			await sql.query("insert into pedido (id_anu, data_pedido, qntd_pedido, valortotal_pedido, id_usuario) values (?, now(),?, ?, ?)", [ pe.id_anu, pe.qntd_pedido, pe.valortotal_pedido, pe.id_usuario]);
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

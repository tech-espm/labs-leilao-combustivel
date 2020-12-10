import Sql = require("../infra/sql");

export = class Anuncio {


	public id_anu: number;
	public prazo_anu: string; 
	public id_origem: number;
    public qtd_anu: number;
    public id_usuario: number;
	public data_anu: string;
	public maxvalor_anu: number;  
	public minvalor_anu: number; 
	public desctransp: string;
    public id_transp: number;
    public id_comb: number;

	private static validar(a: Anuncio): string {
		if (!a)
			return "Anúncio inválido";

		a.id_anu = parseInt(a.id_anu as any);

		a.prazo_anu = (a.prazo_anu || "").normalize().trim();
		if (!a.prazo_anu || a.prazo_anu.length > 45)
			return "Prazo inválido";

		a.qtd_anu = parseInt(a.qtd_anu as any);
		if (isNaN(a.qtd_anu) || a.qtd_anu <= 0 || a.qtd_anu > 9999)
			return "Quantidade inválida";

		a.id_usuario = parseInt(a.id_usuario as any);
		if (isNaN(a.id_usuario))
			return "Usuário inválido";

		if ((typeof a.maxvalor_anu) === "string") {
			a.maxvalor_anu = parseFloat((a.maxvalor_anu as any).normalize().replace(/\./g, "").replace(",", "."));
		} else {
			a.maxvalor_anu = parseFloat(a.maxvalor_anu as any);
		}
		if (isNaN(a.maxvalor_anu) || a.maxvalor_anu < 0)
			return "Valor inválido"; 

		if ((typeof a.minvalor_anu) === "string") {
			a.minvalor_anu = parseFloat((a.minvalor_anu as any).normalize().replace(/\./g, "").replace(",", "."));
		} else {				
			a.minvalor_anu = parseFloat(a.minvalor_anu as any);
			}
		if (isNaN(a.minvalor_anu) || a.minvalor_anu < 0)
			return "Valor inválido";

		a.id_transp = parseInt(a.id_transp as any);
		if (isNaN(a.id_transp))
			return "Variação de transportadora inválida"; 
		
		a.desctransp = (a.desctransp || "").normalize().trim();
		if (!a.desctransp || a.desctransp.length > 45)
			return "Transportadora inválida";

		a.id_comb = parseInt(a.id_comb as any);
		if (isNaN(a.id_comb))
			return "Combustível inválido"; 

		a.id_origem = parseInt(a.id_origem as any);
		if (isNaN(a.id_origem))
			return "Origem inválida";

		return null;
	}

    //Listar Nota Fiscal? Perguntar 
	public static async listar(id_usuario: number): Promise<Anuncio[]> {
		let lista: Anuncio[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select a.id_anu, a.prazo_anu, a.qtd_anu, a.id_usuario, date_format(a.data_anu, '%d/%m/%Y') data_anu, a.maxvalor_anu,a.minvalor_anu, a.id_transp, t.nome_transp, a.id_comb, c.desc_comb, a.id_origem, o.desc_origem from anuncio a inner join transportadora t on t.id_transp = a.id_transp inner join combustivel c on c.id_comb = a.id_comb inner join origem o on o.id_origem = a.id_origem where a.id_usuario = ? order by a.id_anu desc", [id_usuario])) as Anuncio[];
		});

		return (lista || []);
	}

	public static async obter(id_anu: number, id_usuario: number): Promise<Anuncio> {
		let lista: Anuncio[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select a.id_anu, a.prazo_anu, a.qtd_anu, a.id_usuario, date_format(a.data_anu, '%d/%m/%Y') data_anu, a.maxvalor_anu,a.minvalor_anu, a.id_transp, t.nome_transp, a.id_comb, c.desc_comb, a.id_origem, o.desc_origem from anuncio a inner join transportadora t on t.id_transp = a.id_transp inner join combustivel c on c.id_comb = a.id_comb inner join origem o on o.id_origem = a.id_origem where a.id_anu = ? and a.id_usuario = ?", [id_anu, id_usuario]) as Anuncio[];
		});

		return ((lista && lista[0]) || null);
	}
	
	public static async criar(a: Anuncio): Promise<string> {
		let erro = Anuncio.validar(a);
		if (erro)
			return erro;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("insert into anuncio (prazo_anu, qtd_anu, id_usuario, data_anu, maxvalor_anu, minvalor_anu, id_transp, desctransp, id_comb, id_origem) values (?, ?, ?,now(),?,?,?,?,?,?)", [a.prazo_anu, a.qtd_anu, a.id_usuario, a.maxvalor_anu, a.minvalor_anu, a.id_transp, a.desctransp, a.id_comb, a.id_origem]);
		});
		
		return erro;
	}

	public static async alterar(a: Anuncio): Promise<string> {
		let erro = Anuncio.validar(a);
		if (erro)
			return erro;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update anuncio set prazo_anu = ?, qtd_anu = ?, maxvalor_anu = ?, minvalor_anu = ?, id_transp = ?, desctransp = ?, id_comb = ?, id_origem where id_anu = ? and id_usuario = ?", [a.prazo_anu, a.qtd_anu, a.maxvalor_anu, a.minvalor_anu, a.id_transp, a.desctransp, a.id_comb, a.id_origem, a.id_anu, a.id_usuario]);
			if (!sql.linhasAfetadas)
				erro = "Anúncio não encontrado";
		});

		return erro;
	}

	public static async excluir(id_anu: number, id_usuario: number): Promise<string> {
		let erro: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from anuncio where id_anu = ? and id_usuario = ?", [id_anu, id_usuario]);
			if (!sql.linhasAfetadas)
				erro = "Anúncio não encontrado";
		});

		return erro;
	}





}

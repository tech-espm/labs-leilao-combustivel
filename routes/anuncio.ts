import express = require("express");
import wrap = require("express-async-error-wrapper");
import Anuncio = require("../models/anuncio"); 
import Combustivel = require("../models/combustivel") 
import Origem = require("../models/origem") 
import Transportadora = require("../models/transportadora")
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
	res.redirect(appsettings.root + "/");
	else if (u.idtipo !== Usuario.IdTipoDistribuidor)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("anuncio/alterar", {
			titulo: "Criar Anúncio",
			usuario: u,
			item: null,
			tipos: await Transportadora.listar(),
			comb: await Combustivel.listar(), 
			ori: await Origem.listar()

		});
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.superadmin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id_anu = parseInt(req.query["id_anu"] as string);
		let item: Anuncio = null;
		if (isNaN(id_anu) || !(item = await Anuncio.obter(id_anu, u.id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("anuncio/alterar", {
				titulo: "Editar Anúncio",
				usuario: u,
				item: item,
				tipos: await Transportadora.listar(),
				comb: await Combustivel.listar(), 
				ori: await Origem.listar()
			});
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("anuncio/listar", {
			titulo: "Gerenciar Anúncios",
			usuario: u,
			lista: JSON.stringify(await Anuncio.listar(u.id))
		});
}));

export = router;

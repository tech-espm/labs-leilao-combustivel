import express = require("express");
import wrap = require("express-async-error-wrapper");
import Pedido = require("../models/pedido"); 
import Combustivel = require("../models/combustivel") 
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
		res.render("pedido/alterar", {
			titulo: "Criar Anúncio",
			usuario: u,
			item: null,
			tipos: await Transportadora.listar(),
			comb: await Combustivel.listar()
		});
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.superadmin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id_pedido = parseInt(req.query["id_pedido"] as string);
		let item: Pedido = null;
		if (isNaN(id_pedido) || !(item = await Pedido.obter(id_pedido)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("anuncio/alterar", {
				titulo: "Editar Anúncio",
				usuario: u,
				item: item,
				tipos: await Transportadora.listar(),
				comb: await Combustivel.listar()
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
			lista: JSON.stringify(await Pedido.listar(u.id))
		});
}));

export = router;

import express = require("express");
import wrap = require("express-async-error-wrapper");
import Anuncio = require("../models/anuncio"); 
import Combustivel = require("../models/combustivel") 
import Transportadora = require("../models/transportadora")
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("anuncio/alterar", { titulo: "Criar Anuncio", usuario: u, item: null, tipos: await Transportadora.listar(), comb: await Combustivel.listar() });
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id"] as string);
		let item: Anuncio = null;
		if (isNaN(id) || !(item = await Anuncio.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("anuncio/alterar", { titulo: "Editar Anuncio", usuario: u, item: item });
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("anuncio/listar", { titulo: "Gerenciar Anuncios", usuario: u, lista: JSON.stringify(await Anuncio.listar()) });
}));

export = router;

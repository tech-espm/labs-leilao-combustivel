import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario"); 
import Posto = require("../models/posto"); 
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("posto/criar", { titulo: "Criar Posto", usuario: u, item: null, perfis: await Posto.listar() });
})); 

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id"] as string);
		let item: Posto = null;
		if (isNaN(id) || !(item = await Posto.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("posto/alterar", { titulo: "Editar Posto", usuario: u, item: item });
	}
})); 

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("posto/listar", { titulo: "Gerenciar Postos", usuario: u, lista: JSON.stringify(await Posto.listar()) });
}));

export = router;

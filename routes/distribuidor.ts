import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario"); 
import Distribuidor = require("../models/distribuidor"); 
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("distribuidor/criar", { titulo: "Criar Distribuidor", usuario: u, item: null, perfis: await Distribuidor.listar() });
})); 

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id"] as string);
		let item: Distribuidor = null;
		if (isNaN(id) || !(item = await Distribuidor.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("distribuidor/alterar", { titulo: "Editar distribuidor", usuario: u, item: item });
	}
})); 

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("distribuidor/listar", { titulo: "Gerenciar Distribuidoras", usuario: u, lista: JSON.stringify(await Distribuidor.listar()) });
}));
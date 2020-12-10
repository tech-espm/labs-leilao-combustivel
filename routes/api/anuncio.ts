import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Anuncio = require("../../models/anuncio");
import Usuario = require("../../models/usuario");

const router = express.Router();

// Se utilizar router.xxx() mas não utilizar o wrap(), as exceções ocorridas
// dentro da função async não serão tratadas!!!
router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Anuncio.listar(u.id));
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id_anu = parseInt(req.query["id_anu"] as string);
	res.json(isNaN(id_anu) ? null : await Anuncio.obter(id_anu, u.id));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true); 
	if (!u)
		return;

	if (u.idtipo !== Usuario.IdTipoDistribuidor) {
		res.statusCode = 403;
		res.json("Não permitido");
		return;
	}

	let p = req.body as Anuncio; 
	if (p)
		p.id_usuario = u.id;

	jsonRes(res, 400, await Anuncio.criar(p));
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Anuncio;
	if (p)
		p.id_usuario = u.id;
	jsonRes(res, 400, await Anuncio.alterar(p));
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id_anu = parseInt(req.query["id_anu"] as string);
	jsonRes(res, 400, isNaN(id_anu) ? "Dados inválidos" : await Anuncio.excluir(id_anu, u.id));
}));

export = router;

import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Pedido = require("../../models/pedido");
import Usuario = require("../../models/usuario");

const router = express.Router();

// Se utilizar router.xxx() mas não utilizar o wrap(), as exceções ocorridas
// dentro da função async não serão tratadas!!!
router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Pedido.listar(u.id));
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id"] as string);
	res.json(isNaN(id) ? null : await Pedido.obter(id));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true); 
	if (!u)
		return;
	if (u.idtipo !== Usuario.IdTipoPosto) 
			res.statusCode = 403;
			res.json("Não permitido");
	let p = req.body as Pedido; 
	

	if (p)
		p.id_usuario = u.id;
	jsonRes(res, 400, await Pedido.criar(p));
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Pedido;
	if (p)
		p.id_usuario = u.id;
	jsonRes(res, 400, await Pedido.alterar(p));
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Pedido.excluir(id));
}));

export = router;

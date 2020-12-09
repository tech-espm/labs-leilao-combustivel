import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Usuario = require("../../models/usuario");
import multer = require("multer");

const router = express.Router();

// Se utilizar router.xxx() mas não utilizar o wrap(), as exceções ocorridas
// dentro da função async não serão tratadas!!!
router.post("/alterarPerfil", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	jsonRes(res, 400, await u.alterarPerfil(res, req.body.nome as string, req.body.senhaAtual as string, req.body.novaSenha as string));
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	res.json(await Usuario.listarGeral());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id"] as string);
	res.json(isNaN(id) ? null : await Usuario.obterGeral(id));
}));

router.post("/criar", multer().fields([ { name: "contratosocial", maxCount: 1 }, { name: "extratobancario", maxCount: 1 } ]), wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	let novo = req.body as Usuario;
	if (!novo) {
		res.status(400).json("Dados inválidos");
		return;
	}
	if (!u) {
		novo.idperfil = Usuario.IdPerfilAdmin;
		novo.idtipo = parseInt(novo.idtipo as any);
		if (novo.idtipo !== Usuario.IdTipoPosto && novo.idtipo !== Usuario.IdTipoDistribuidor) {
			res.status(400).json("Tipo inválido");
			return;
		}
	}

	const contratosocial = (req["files"] && req["files"].contratosocial && req["files"].contratosocial[0]);
	const extratobancario = (req["files"] && req["files"].extratobancario && req["files"].extratobancario[0]);

	if (!contratosocial) {
		res.status(400).json("Contrato social faltando");
		return;
	}

	if (!contratosocial.buffer || !contratosocial.size) {
		res.status(400).json("Contrato social inválido");
		return;
	}

	if (contratosocial.size > (2 * 1024 * 1024)) {
		res.status(400).json("Contrato social muito grande");
		return;
	}

	if (!extratobancario) {
		res.status(400).json("Extrato bancário faltando");
		return;
	}

	if (!extratobancario.buffer || !extratobancario.size) {
		res.status(400).json("Extrato bancário inválido");
		return;
	}

	if (extratobancario.size > (2 * 1024 * 1024)) {
		res.status(400).json("Extrato bancário muito grande");
		return;
	}

	jsonRes(res, 400, await Usuario.criarGeral(novo, contratosocial, extratobancario));
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = u.id;
	u = req.body as Usuario;
	jsonRes(res, 400, (u && !isNaN(u.id)) ? (id === u.id ? "Um usuário não pode alterar a si próprio" : await Usuario.alterarGeral(u)) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : (id === u.id ? "Um usuário não pode excluir a si próprio" : await Usuario.excluir(id)));
}));

router.get("/redefinirSenha", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : (id === u.id ? "Um usuário não pode redefinir sua própria senha" : await Usuario.redefinirSenha(id)));
}));

export = router;

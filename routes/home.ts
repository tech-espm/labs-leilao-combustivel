import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/login");
	} else {
		res.render("home/dashboard", { titulo: "Dashboard", usuario: u });
	}
}));

router.all("/tipocadastro", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/tipocadastro", { layout: "layout-publico", titulo: "Escolha o tipo" });
}));

router.all("/cadastro", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/cadastro", { layout: "layout-publico", titulo: "Cadastro" });
}));

router.all("/novospedidos", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/novospedidos", { layout: "layout-publico-rodape", titulo: "Novos Pedidos" });
}));

router.all("/homeposto", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/homeposto", { layout: "layout-publico-rodape", titulo: "HOME Posto" });
}));

router.all("/comprafim", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/comprafim", { layout: "layout-publico-rodape", titulo: "Compra Finalizada!" });
}));

router.all("/tendencias", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/tendencias", { layout: "layout-publico-rodape", titulo: "Tendências" });
}));

router.all("/relatorios", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/relatorios", { layout: "layout-publico-rodape", titulo: "Relatórios" });
}));

router.all("/pedidosmktplace", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/pedidosmktplace", { layout: "layout-publico-rodape", titulo: "Pedidos MKT Place" });
}));

router.all("/distribuidora/vendas", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/distribuidoravendas", { layout: "layout-publico-rodape", titulo: "Vendas Distribuidora" });
}));

router.all("/distribuidora/relatorios", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/distribuidorarelatorios", { layout: "layout-publico-rodape", titulo: "Relatórios Distribuidora" });
}));

router.all("/distribuidora/cadastro", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/distribuidoracadastro", { layout: "layout-publico-rodape", titulo: "Cadastro Distribuidora" });
}));

router.all("/distribuidora/abertura", wrap(async (req: express.Request, res: express.Response) => {
	res.render("publico/distribuidoraabertura", { layout: "layout-publico-rodape", titulo: "Abertura de Crédito Distribuidora" });
}));



router.all("/login", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		let mensagem: string = null;

		if (req.body.login || req.body.senha) {
			[mensagem, u] = await Usuario.efetuarLogin(req.body.login as string, req.body.senha as string, res);
			if (mensagem)
				res.render("home/login", { layout: "layout-externo", mensagem: mensagem });
			else
				res.redirect(appsettings.root + "/");
		} else {
			res.render("home/login", { layout: "layout-externo", mensagem: null });
		}
	} else {
		res.redirect(appsettings.root + "/");
	}
}));

router.get("/acesso", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/login");
	else
		res.render("home/acesso", { titulo: "Sem Permissão", usuario: u });
}));

router.get("/perfil", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/");
	else
		res.render("home/perfil", { titulo: "Meu Perfil", usuario: u });
}));

router.get("/logout", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (u)
		await u.efetuarLogout(res);
	res.redirect(appsettings.root + "/");
}));

router.all("/exemplo", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/");
	else if (u.idtipo !== Usuario.IdTipoPosto)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("home/perfil", { titulo: "Meu Perfil", usuario: u });
}));

export = router;

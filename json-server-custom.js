const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// 🔎 Rota customizada para buscar em aplicacoes
server.get("/ds/aplicacoes", (req, res) => {
  const { modelo, montadora, ano, versao } = req.query;

  // carrega os produtos do db.json
  const produtos = router.db.get("produtos").value();

  // filtra dentro de aplicacoes
  const resultado = produtos.filter((p) =>
    p.aplicacoes.some((a) => {
      return (
        (!modelo || a.modelo.toLowerCase() === modelo.toLowerCase()) &&
        (!montadora || a.montadora.toLowerCase() === montadora.toLowerCase()) &&
        (!ano || a.ano === ano) &&
        (!versao || a.versao.toLowerCase() === versao.toLowerCase())
      );
    })
  );

  res.json(resultado);
});

// Usa o roteador padrão do json-server
server.use(router);

// Sobe o servidor
server.listen(3002, () => {
  console.log("🚀 JSON Server rodando em http://localhost:3000");
});

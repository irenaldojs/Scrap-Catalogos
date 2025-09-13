const axios = require('axios');

// URL do seu json-server
const API_URL = 'http://localhost:3001/produtos';

// Exemplo de um novo produto para adicionar.
// A estrutura deve ser a mesma que você salva no seu script de scraping.
const novoProduto = {
    link: "https://www.ds.ind.br/pt/produtos/exemplo/9999",
    imagem: "https://www.ds.ind.br/cache/media/gallery/exemplo.jpg",
    linha: "Linha de Exemplo",
    codigo: "DS:9999"
};

async function adicionarProduto() {
    try {
        const response = await axios.post(API_URL, novoProduto);
        console.log('Produto adicionado com sucesso:');
        console.log(response.data); // O json-server retorna o objeto criado com um `id`
    } catch (error) {
        console.error('Ocorreu um erro ao adicionar o produto:', error.message);
    }
}

adicionarProduto();

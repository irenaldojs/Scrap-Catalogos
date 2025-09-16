const axios = require("axios");
const { clear } = require("console");
const puppeteer = require("puppeteer");

const API_URL = 'http://localhost:3001/arteb';
const CATALOGO_URL = 'https://www.arteb.com.br/catalogo/';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const produtos = []
    const pageTogal = 27

    for (let i = 1; i < pageTogal; i++) {
        console.log("passo :", i)

        await page.goto(CATALOGO_URL + "/page/" + i, { waitUntil: 'load' })
        const selector = 'ul.products.columns-4 > li';
        await page.waitForSelector(selector);

        const listaProdutos = await page.evaluate((sel) => {
            // Retorna a quantidade de itens encontrados.
            const elementos = document.querySelectorAll(sel);

            // Você também pode extrair informações de cada elemento, como o título do produto.
            const produtos = Array.from(elementos).map(li => {
                const titulo = li.querySelector('h2.woocommerce-loop-product__title').innerText.split(' – ');
                const link = li.querySelector('a.woocommerce-LoopProduct-link').href;
                const imagemElement = li.querySelector('div.thumbnail_container > img');
                const imgSrc = imagemElement.getAttribute('data-src') || imagemElement.getAttribute('src');
                const id = titulo.pop().replace(/^0+/, '');
                const referencia = titulo.join(" ");

                return { id, referencia, link, image: imgSrc };
            });

            return produtos;

        }, selector);

        listaProdutos.forEach((produto) => produtos.push(produto));
    }

    for (let i = 0; i < produtos.length; i++) {
        await page.goto(produtos[i].link, { waitUntil: 'load' });
        console.log('item ', produtos[i].id)
        // talvez esperar por seletor que garante que parte dinamica carregou
        // ex: await page.waitForSelector('#tab-description');

        const texts = await page.evaluate(() => {
            let montadora = document.querySelector('#tab-description > p:nth-child(6)');
            montadora = montadora ? montadora.innerText.trim() : null;

            const linha = document.querySelector('#tab-description > p:nth-child(8)');

            const atributos = []
            let lado = document.querySelector('#tab-description > p:nth-child(12)');
            if (lado && lado.innerText.trim() !== "–") atributos.push(`Lado:${lado.innerText.trim()}`)

            let descricao = document.querySelector('#tab-description > p:nth-child(2)');
            if (descricao && descricao.innerText.trim() !== "–") atributos.push(`Descrição:${descricao.innerText.trim()}`)

            let atributosAdicionais = Array.from(
                document.querySelectorAll('table.woocommerce-product-attributes.shop_attributes tr')
            ).map(tr => {
                const th = tr.querySelector('th')?.textContent.trim() || '';
                const td = tr.querySelector('td')?.textContent.trim() || '';
                return `${th}:${td}`;
            });

            atributosAdicionais = atributosAdicionais.filter((_, i) => i !== 3 && i !== 4);

            atributos.push(...atributosAdicionais);

            const aplicacoes = [];
            let aplicacoesText = document.querySelector("#tab-additional_information > table > tbody > tr.woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_pa_veiculo > td > p > a")
            aplicacoesText = aplicacoesText.innerText.trim().split("/");


            aplicacoesText.forEach(a => aplicacoes.push({
                montadora,
                modelo: a,
            }))

            return {
                linha: linha ? linha.innerText.trim() : null,
                atributos,
                aplicacoes
            };
        });

        const imagens = await page.evaluate(() => {
            return [...document.querySelectorAll("a.lightbox-added")]
                .map(a => a.href);
        });

        const data = {
            ...produtos[i],
            ...texts,
            imagens
        }
        await POST(data);
    }


    await browser.close();
})();

async function POST(data) {
    console.log(data)

    try {
        const response = await axios.post(API_URL, data);
        console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }

}

<<<<<<< HEAD
import axios from "axios";
import puppeteer from "puppeteer";
=======
const axios = require("axios");
const { clear } = require("console");
const puppeteer = require("puppeteer");
>>>>>>> nafil

const API_URL = 'http://localhost:3001/arteb';
const CATALOGO_URL = 'https://www.arteb.com.br/catalogo/';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

<<<<<<< HEAD
    const linha = "Diversos"
    const res = await GET_LINHA(linha)
    const produtos = res.data
    const passosTotais = produtos.length
=======
    const produtos = []
    const pageTogal = 27
>>>>>>> nafil

    for (let i = 1; i < pageTogal; i++) {
        console.log("passo :", i)

<<<<<<< HEAD
    for (i = 0; i < passosTotais; i++) {
        console.log(linha, "passo:", String(Number(i + 1) + "/" + passosTotais));
=======
        await page.goto(CATALOGO_URL + "/page/" + i, { waitUntil: 'load' })
        const selector = 'ul.products.columns-4 > li';
        await page.waitForSelector(selector);
>>>>>>> nafil

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
<<<<<<< HEAD
            link: produtos[i].link,
            nome: produtos[i].nome,
            linha,
            id: produtos[i].id,
            equivalentes,
            aplicacoes: formataAplicacoes,
            imagens,
            atributos: atributosFormatados
=======
            ...produtos[i],
            ...texts,
            imagens
>>>>>>> nafil
        }
        await POST(data);
    }


    await browser.close();
})();

<<<<<<< HEAD

export async function POST(data) {
=======
async function POST(data) {
    console.log(data)
>>>>>>> nafil

    try {
        const response = await axios.post(API_URL, data);
        console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }

}
<<<<<<< HEAD
export async function PUT(data) {

    try {
        const response = (await axios.put(API_URL + "/" + data.id, data));
        //console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error.message);
    }

}

export async function GETALL() {
    try {
        const response = (await axios.get(API_URL));
        return response
    } catch (error) {
        console.error('Erro ao enviar dados:', error)
        return error
    }

}

async function GET_ID(id) {
    try {
        const response = await (await axios.get(API_URL + "/" + id));
        console.log('Dados enviados com sucesso:', response);
        return response
    } catch (error) {
        console.error('Erro ao enviar dados:', error)
        return error
    }

}

async function GET_LINHA(linha) {
    try {
        const response = await (await axios.get(API_URL + "?linha=" + linha));
        return response
    } catch (error) {
        console.error('Erro ao enviar dados:', error)
        return error
    }
}
=======
>>>>>>> nafil

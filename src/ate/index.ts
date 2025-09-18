import { APLICACAO } from './../type/produto';

import puppeteer from "puppeteer";
import { GET, POST, PUT } from "../service/json-server";
import { PRODUTO } from "../type/produto";

const API_URL = 'http://localhost:3001/ate';
const CATALOGO_URL = 'https://catalogoexpresso.com.br/ATE/resultado.php?cw_ordenacao=cw-ordena-lancamento&cw_ie_tp=0&cw_pgAtual=';
const PAGINAS = 269;


export async function LISTA_PRODUTOS_ATE() {

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    for (let i = 1; i < PAGINAS; i++) {
        console.log("PAGINA: ", i)
        await page.goto(CATALOGO_URL + i, { waitUntil: 'load' })

        const items = await page.evaluate(() => {
            const SELETOR = "#cw-lista a.caixaProdutoHome"
            return Array.from(document.querySelectorAll(SELETOR)).map(a => {
                if (!(a instanceof HTMLAnchorElement)) return null;

                // procura o id dentro do <a>
                const idEl = a.querySelector("#cw-numero-produto");
                const id = idEl ? idEl.textContent?.trim() : null;

                if (!id) return null;

                const linhaEl = a.querySelector(".descricaoProduto")
                const linha = linhaEl ? linhaEl.textContent?.trim() : null;

                if (!linha) return null;

                const imagemEl = a.querySelector(".fotoProdutoHome img")
                const imagem = imagemEl instanceof HTMLImageElement ? imagemEl.src : null;

                return {
                    id,
                    linha,
                    link: a.href,
                    imagem
                };
            }).filter(Boolean);
        })

        items.forEach(async (item) => PUT(API_URL, item as PRODUTO))
    }


    await browser.close();
}

export async function COMPLETAR_CADASTROS_ATE() {
    const produtos = await GET(API_URL);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    for (let i = 0; i < PAGINAS; i++) {
        const produto = produtos[i];
        await page.goto(produto.link, { waitUntil: 'load' })
        console.log(produto.id, produto.link)

        const atributos = await page.evaluate(() => {
            const SELETOR = "#container-campos-produto div";

            return Array.from(document.querySelectorAll(SELETOR)).map(div => {
                if (!(div instanceof HTMLDivElement)) return null;

                // procura o id dentro do <a>
                const chaveEl = div.querySelector("strong");
                const chave = chaveEl ? chaveEl.textContent?.trim() : null;

                if (!chave) return null;

                const valorEl = div.querySelector("span")
                const valor = valorEl ? valorEl.textContent?.trim() : null;

                if (!valor) return null;

                return chave + valor

            }).filter(Boolean);
        })

        const equivalentes = await page.evaluate(() => {
            const SELETOR = ".caixaConversao table";

            return Array.from(document.querySelectorAll(SELETOR)).map(table => {

                // procura o id dentro do <a>
                const chaveEl = table.querySelector("th");
                const chave = chaveEl ? chaveEl.textContent?.trim() : null;

                if (!chave) return null;

                const valorEl = table.querySelector("td")
                const valor = valorEl ? valorEl.textContent?.trim() : null;

                if (!valor) return null;

                return chave + ":" + valor

            }).filter(Boolean);

        })

        const imagens = await page.evaluate(() => {
            const SELETOR = "#box-imagens-select";

            return Array.from(document.querySelectorAll(SELETOR)).map(div => {
                if (!(div instanceof HTMLDivElement)) return null;
                const img = div.querySelector("img")
                if (!(img instanceof HTMLImageElement)) return null;
                if (!img.src) return null;
                console.log(img.src)
                return img.src;
            }).filter(Boolean);
        })

        const aplicacoes = await page.$$eval('div.scroll-detalhes-produto > table > tbody', tbodies => {
            // tbodies é array de elementos <tbody>
            return tbodies.map(tbody => {
                // para cada tbody, você pode extrair o que quiser. Ex: todas as linhas e colunas.
                if (tbody.id == "cw-fabricante-aplicacao") return;

                const montadora = tbody.querySelector('th.tituloMontadora')?.textContent?.trim();

                const rows = Array.from(tbody.querySelectorAll('tr')).map(tr => {
                    const cols = Array.from(tr.querySelectorAll('td'));
                    return cols.map(td => td.innerText.trim()).filter(Boolean).filter(col => col !== "- -");
                }).filter(row => row.length > 0);

                return rows.map(row => Object({ montadora, modelo: row[0], versao: row[1], ano: row[2] }))

            }).filter(Boolean)[0];
        });

        const data = {
            ...produto,
            atributos,
            equivalentes,
            imagens,
            aplicacoes
        }

        //console.log(data)
        await PUT(API_URL, data as PRODUTO)
    }
    await browser.close();
}
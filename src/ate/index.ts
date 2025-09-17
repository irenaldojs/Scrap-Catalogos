
import puppeteer from "puppeteer";
import { POST } from "../service/json-server";
import { PRODUTO } from "../type/produto";

const API_URL = 'http://localhost:3001/ate';
const CATALOGO_URL = 'https://catalogoexpresso.com.br/ATE/resultado.php?cw_ordenacao=cw-ordena-lancamento&cw_ie_tp=0&cw_pgAtual=';
const PAGINAS = 269;


export async function LISTA_PRODUTOS() {

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    for (let i = 145; i < PAGINAS; i++) {
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

                const imagemEl = a.querySelector("img")
                const imagem = imagemEl instanceof HTMLImageElement ? imagemEl.src : null;

                return {
                    id,
                    linha,
                    link: a.href,
                    imagem
                };
            }).filter(Boolean);
        })

        items.forEach(async (item) => POST(API_URL, item as PRODUTO))
    }


    await browser.close();
}

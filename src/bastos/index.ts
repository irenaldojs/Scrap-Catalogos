import puppeteer from "puppeteer";
import { API_URL } from "..";
import { GET, POST, POST_AUX, PUT } from "../service/json-server";
import { PRODUTO } from "../type/produto";

const CATALOGO_URL = "https://www.c123.com.br/bastos/index.asp"
const PAGINAS = 0

type CT_BAS = {
    id: string,
    nome: string
}

export async function FORMATAR_CATEGORIAS_BASTOS() {
    const categorias: CT_BAS[] = await GET(API_URL + "bastos_categorias")

    const categorias_format = categorias.map(categoria => {
        const nome = categoria.nome.replace("JTA", "JUNTA")
        return {
            ...categoria,
            nome
        }
    })
    console.log(categorias_format)
}

export async function LISTA_CATEGORIAS_BASTOS() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    await page.goto(CATALOGO_URL, { waitUntil: 'load' })

    await page.waitForSelector("div#shpSubGrupoProduto")
    await page.click("div#shpSubGrupoProduto")


    const items = await page.evaluate(() => {

        const SELETOR = "#SelCombo option"
        const categorias = Array.from(document.querySelectorAll(SELETOR)).map(option => {
            if (!(option instanceof HTMLOptionElement)) return null;
            return {
                id: option.value,
                nome: option.textContent?.trim()
            };
        }).filter(Boolean);

        return categorias;
    })

    items.forEach(async (item) => POST_AUX(API_URL + "bastos_categorias", item as PRODUTO))

    await browser.close();
}

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
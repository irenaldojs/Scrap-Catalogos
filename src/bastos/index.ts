import puppeteer from "puppeteer";
import { API_URL } from "..";
import { GET, POST, POST_AUX, PUT } from "../service/json-server";
import { APLICACAO, PRODUTO } from "../type/produto";

const CATALOGO_URL = "https://www.c123.com.br/bastos/index.asp"
const PAGINAS = 0

type CT_BAS = {
    id: string,
    nome: string
}

export async function FORMATAR_CATEGORIAS_BASTOS() {
    const categorias: CT_BAS[] = await GET(API_URL + "bastos_categorias" + "/1364")

    const categorias_format = categorias.map(categoria => {
        const nome = categoria.nome
        //.replace("JTA", "JUNTA").replace("JG MTR", "JG JUNTA MOTOR")

        return {
            ...categoria,
            linha: "anel sensor temperatura",
            "referencia_replace": "ANEL SENSOR TEMPERATURA DAGUA"
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

export async function POST_BASTOS() {
    const categoria_cod = 1364;
    const BASTOS_URL_CAT = 'https://www.c123.com.br/bastos/res.asp?s='+ categoria_cod
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    await page.goto(BASTOS_URL_CAT, { waitUntil: 'load' })

    await page.waitForSelector("#tabgrid");

    const items = await page.evaluate(() => {
        const seletor = "#tabgrid tbody"

        const tbody = document.querySelector(seletor)

        const rows = tbody && Array.from(tbody?.querySelectorAll("tr")).map(
                 tr => {
                    const replace = "ANEL SENSOR TEMPERATURA DAGUA"
                    const data: PRODUTO = { linha: replace }   
                    Array.from( tr.querySelectorAll("td.bbl")).forEach(
                        (td, index) => {    
                        const text = td.textContent.trim()

                        if(index == 0)data.id = text
                        if(index == 1)data.referencia = text.replace(replace, "")                        
                    })
                    const row = document.querySelector("#"+tr.id)
                    if(row instanceof HTMLTableRowElement) row.click();

                    const equivalentes = Array.from(document.querySelectorAll("#objCon1 table tbody tr")).map(tr => tr.textContent.trim())
                    data.equivalentes = equivalentes

                    let montadora = ""

                    const aplicacoes = Array.from(document.querySelectorAll("#tabAplic tbody tr")).map(
                        tr => {
                            
                        const isMontadora = tr.querySelector("[style='color:#3D5F08;']")?.textContent.trim()
                        
                        if(isMontadora){
                            montadora = isMontadora;
                            return;
                        }

                        let aplicacao: APLICACAO = { montadora }
                        
                        const tds = Array.from(tr.querySelectorAll("td"))
                        const modelo = tds[0] && tds[0].textContent?.trim()
                        const ano = tds[1] && tds[1].textContent?.trim()
                        const versao = tds[3] && tds[2] && tds[3].textContent?.trim() + " " + tds[2].textContent?.trim()                            

                        aplicacao.modelo = modelo
                        aplicacao.montadora = montadora
                        aplicacao.ano = ano
                        aplicacao.versao = versao

                        return {...aplicacao}
                        }
                    ).filter(Boolean).filter(item => item?.modelo !== "" && item?.modelo !== montadora) as APLICACAO[]

                    data.aplicacoes = aplicacoes
                    data.link = "https://www.c123.com.br/bastos/res.asp?n=" + data.id
                    
                    const image = `https://www.c123.com.br/bastos/FotoRetArq.asp?a=${data.id}%2Ejpg`
                    data.image = image

                if(data.id !== "")return data
            }
        ).filter(Boolean)
        
        return rows
    })

    items?.forEach(item => console.log(item))

    browser.close()
}

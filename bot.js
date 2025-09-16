import axios from "axios";
import puppeteer from "puppeteer";

const API_URL = 'http://localhost:3001/ds';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const linha = "Diversos"
    const res = await GET_LINHA(linha)
    const produtos = res.data
    const passosTotais = produtos.length


    for (i = 0; i < passosTotais; i++) {
        console.log(linha, "passo:", String(Number(i + 1) + "/" + passosTotais));

        await page.goto(produtos[i].link, { waitUntil: 'load' });
        await page.waitForSelector('body > main > article > section.detalhes > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(3) > div > div > table > tbody');

        const equivalentes = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('body > main > article > section.detalhes > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(3) > div > div > table > tbody > tr'))
                .map(tr => tr.innerText.trim())
        });

        const aplicacoes = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('body > main > article > section.detalhes > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(4) > div > div > table > tbody > tr'))
                .map(tr => tr.innerText.trim().split("\t"))
        });

        const formataAplicacoes = aplicacoes.map(aplicacao => {
            let versao = (aplicacao[2] + (aplicacao[3] ? " " + aplicacao[3] : "") + (aplicacao[5] ? " " + aplicacao[5] : "")).replaceAll("-", "");
            versao = versao == " " ? "" : versao;

            return {
                montadora: aplicacao[0],
                modelo: aplicacao[1],
                ano: aplicacao[4].replaceAll(" ", "").replace(">", "/").replaceAll("-", ""),
                versao
            }
        })

        const imagens = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('body > main > article > section.detalhes > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div > div > ul > li > img'))
                .map(img => img.src)
        })


        const atributos = await page.evaluate(() => {
            const span = document.querySelector("body > main > article > section.detalhes > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > p > span");
            return span ? span.innerText.trim().split("|") : null;
        });

        const atributosFormatados = atributos.map(item => item.replaceAll(': ', ':').replace(/^\s+|\s+$/g, ""))

        const data = {
            link: produtos[i].link,
            nome: produtos[i].nome,
            linha,
            id: produtos[i].id,
            equivalentes,
            aplicacoes: formataAplicacoes,
            imagens,
            atributos: atributosFormatados
        }

        //console.log(data)
        PUT(data);
    }

    console.log(`Finalizando ${produtos.length} registros.`)
    await browser.close();
})();


export async function POST(data) {

    try {
        const response = await axios.post(API_URL, data);
        console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }

}
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
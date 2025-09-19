const fs = require('fs');
const puppeteer = require('puppeteer');
const axios = require('axios');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    //const produtos = [];
    /*
    await page.goto(`https://www.ds.ind.br/pt/busca?montadora=&modelo=&linha=0`, { waitUntil: 'load' });
    await page.waitForSelector('body > main > article > section.resultado > div > div:nth-child(4) > div > div > div > ul');
    let paginas = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('body > main > article > section.resultado > div > div:nth-child(4) > div > div > div > ul'))
            .map(li => li.children[li.children.length - 2].innerText.trim());
    });
    paginas = parseInt(paginas);
    console.log(`Processando linhas de produto com ${paginas} páginas.`);
    */
    let paginas = 423; // Definido manualmente após buscar os números de categorias


    for (let i = 1; i <= paginas; i++) {
        console.log(i);
        await page.goto(`https://www.ds.ind.br/pt/busca?montadora=&modelo=&linha=0&page=${i}`, { waitUntil: 'load' });
        // esperar a pagina carregar
        await page.waitForSelector('body > main > article > section.resultado > div > div:nth-child(3) > div > ul');

        // buscar uma lista de textos da lista
        const list = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('body > main > article > section.resultado > div > div:nth-child(3) > div > ul > li'))
                .map(li => {
                    const anchor = li.querySelector('a');
                    const img = li.querySelector('img');
                    const p = li.querySelector('p');
                    return {
                        link: anchor ? anchor.href : '',
                        imagem: img ? img.src : '',
                        texto: p ? p.innerText.trim() : ''
                    };
                });
        });

        for (let i = 0; i < list.length; i++) {
            const produto = list[i].texto;
            const texto = produto.split(' - ');
            const dado = {
                id: texto[1],
                linha: texto[0],
                imagem: list[i].imagem,
                link: list[i].link

            }
            POST(dado);
        }
    }

    ///console.log(produtos);

    //fs.writeFileSync('produtos.json', JSON.stringify({ produtos: produtos }, null, 2));

    await browser.close();
})();

async function POST(data) {
    const API_URL = 'http://localhost:3001/ds';

    try {
        const response = await axios.post(API_URL, data);
        console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }

}
async function PUT(data) {
    const API_URL = 'http://localhost:3001/ds/' + data.id;

    try {
        const response = await axios.put(API_URL, data);
        console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }

}
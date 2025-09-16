const fs = require('fs');
const puppeteer = require('puppeteer');
/*
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  const produtos = []

  // Aguardar o seletor da aba de busca avançada ou botão correspondente
  await page.goto('https://www.ds.ind.br/pt/busca?montadora=&modelo=&linha=5', { waitUntil: 'load' });

  // Aguardar o seletor da aba de busca avançada ou botão correspondente
  await page.waitForSelector('body > main > article > section.resultado > div > div:nth-child(4) > div > div > div > ul');

  // Nesta lista buscar o penúltimo item
  let paginas = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('body > main > article > section.resultado > div > div:nth-child(4) > div > div > div > ul'))
                .map(li => li.children[li.children.length - 2].innerText.trim());
  });
  paginas = parseInt(paginas);
  

  for (let i = 1; i <= paginas; i++) {
    console.log(i);
    await page.goto(`https://www.ds.ind.br/pt/busca?montadora=&modelo=&linha=5&page=${i}`, { waitUntil: 'load' });
    // esperar a pagina carregar
    await page.waitForSelector('body > main > article > section.resultado > div > div:nth-child(3) > div > ul');

    // buscar uma lista de textos da lista
    const list = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('body > main > article > section.resultado > div > div:nth-child(3) > div > ul > li'))
                  .map(li => li.innerText.trim())
    });

    for (let i = 0; i < list.length; i++) {
      const produto = list[i];
      const texto = produto.split(' - ')
      produtos.push({
        codigo: texto[1],
        produto: texto[0]
      })
    }
  }

  console.log(produtos);

  fs.writeFileSync('produtos.json', JSON.stringify(produtos));
  
  await browser.close();
})();
*/

const produtos = require('../produtos.json');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(0);

  for (let i = 0; i < produtos.length; i++) {

    if (!produtos[i].codigo) return;

    console.log(produtos[i].codigo);

    await page.goto(`https://www.ds.ind.br/pt/produtos/sensor-de-pressao-absoluta-map/${produtos[i].codigo}`, { waitUntil: 'load' });

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
      return {
        montadora: aplicacao[0],
        modelo: aplicacao[1],
        ano: aplicacao[4].replace(" ", ""),
        versao: aplicacao[2] + " " + aplicacao[3] + (aplicacao[5] ? " " + aplicacao[5] : ""),
      }
    })

    const imagens = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('body > main > article > section.detalhes > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div > div > ul > li > img'))
        .map(img => img.src)
    })

    console.log(imagens);

    produtos[i] = {
      codigo: produtos[i].codigo,
      produto: produtos[i].produto,
      equivalentes: equivalentes,
      aplicacoes: formataAplicacoes,
      imagens: imagens
    }
  }

  console.log("Salvando os dados ...");
  fs.writeFileSync('produtos-ds.json', JSON.stringify(produtos));

  console.log("Fechando o navegador ...");
  await browser.close();

  console.log("Processo finalizado!", produtos.length);

})()
const fs = require("fs")
const axios = require("axios")
const puppeteer = require("puppeteer");

const API_URL = 'http://localhost:3001/ds';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const linha = "Sensor de Velocidade (VSS)"
    const res = await GET_LINHA(linha)
    const produtos = res.data
    const passosTotais = produtos.length


    for (i = 0; i < passosTotais; i++) {
        console.log(linha, "passo:", String(Number(i+1) + "/"+passosTotais));

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
            ...produtos[i],
            //descricao: atributosFormatados[0].split(":")[1],
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


async function POST(data) {

    try {
        const response = await axios.post(API_URL, data);
        console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }

}
async function PUT(data) {

    try {
        const response = (await axios.put(API_URL + "/" + data.id, data));
        //console.log('Dados enviados com sucesso:', response.data);
    } catch (error) {
        console.error('Erro ao enviar dados:', error.message);
    }

}

async function GETALL() {
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
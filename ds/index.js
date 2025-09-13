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

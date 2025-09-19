const fs = require('fs');
const puppeteer = require('puppeteer');

async function buscarElementosAposClique(url) {
    const browser = await puppeteer.launch({ headless: false }); // Usar headless: false para ver o navegador
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Seletor do elemento que precisa ser clicado
    const seletorBotao = '#header-filters > div > div.column.large-4.medium-4.small-12 > span';

    // Espera o botão estar visível e clicável e então clica nele
    await page.waitForSelector(seletorBotao);
    await page.click(seletorBotao);

    // Em vez de uma espera fixa, é melhor esperar pelo seletor que deve aparecer após o clique.
    // Isso torna o script mais robusto e eficiente.
    const seletorDinamico = '[id^="select2-linha-produtos-result"]';
    await page.waitForSelector(seletorDinamico);

    // Agora, busca os elementos que aparecem após o clique
    const seletoresEncontrados = await page.$$eval('[id^="select2-linha-produtos-result"]', elements => {
        return elements.map(element => element.id);
    });

    const seletoresFatorados = seletoresEncontrados.map(id => id.replace('select2-linha-produtos-result-', '')).filter(id => id !== 'select2-linha-produtos-results').map(id => id.split('-')[1]).sort((a, b) => parseInt(a) - parseInt(b));

    fs.writeFileSync('seletores.json', JSON.stringify(seletoresFatorados, null, 2));

    console.log('IDs dos elementos encontrados após o clique:', seletoresFatorados);

    await browser.close();
}

// Exemplo de uso:
buscarElementosAposClique('https://www.ds.ind.br/pt/busca?montadora=&modelo=&linha='); // Substitua pela URL real do seu site
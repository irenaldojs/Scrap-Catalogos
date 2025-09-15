const axios = require("axios")
const puppeteer = require("puppeteer");

const API_URL = 'http://localhost:3001/arteb';
const CATALOGO_URL = 'https://www.arteb.com.br/catalogo/?pa_linha=leve';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const produtos = []

    const pageTogal = 27
    
    for (let i=1; i < 2; i++){
        console.log("passo :", i)

        await page.goto(CATALOGO_URL + "/page/" + i,  { waitUntil: 'load' })
        const selector = 'ul.products.columns-4 > li';
        await page.waitForSelector(selector);

        const listaProdutos = await page.evaluate((sel) => {
            // Retorna a quantidade de itens encontrados.
            const elementos = document.querySelectorAll(sel);
            
            // Você também pode extrair informações de cada elemento, como o título do produto.
            const produtos = Array.from(elementos).map(li => {
                const titulo = li.querySelector('h2.woocommerce-loop-product__title').innerText.split(' – ');
                const link = li.querySelector('a.woocommerce-LoopProduct-link').href;
                const imagemElement = li.querySelector('div.thumbnail_container > img');
                const imgSrc = imagemElement.getAttribute('data-src') || imagemElement.getAttribute('src');
                const id = titulo.pop();
                const referencia = titulo.join(" ");
                return { id, referencia , link, image: imgSrc }; 
            });

            return produtos;
            
        }, selector);

        listaProdutos.forEach(produto => produtos.push(produto));
    }

    for(let i = 0; i < produtos.length; i++){
        await page.goto(produtos[i].link, { waitUntil: 'load' });

        const selector2 = '#tab-description > p:nth-child(2)';
        await page.waitForSelector(selector2);

        const info = await page.evaluate((sel) => {
            const elementos = document.querySelectorAll(sel);
            
            const infoArray = Array.from(elementos).map(item => {
                // Seletores para os elementos
                const montadoraElement = item.querySelector("tr.woocommerce-product-attributes-item--attribute_pa_montadora a"); 
                               
                // Verifique se o elemento existe antes de tentar acessar 'innerText'
                const montadora = montadoraElement ? montadoraElement.innerText : null;
                
                return { montadora };
            });

            return infoArray;
        }, selector2);
        
        console.log(info);
    }

    await browser.close();
})();



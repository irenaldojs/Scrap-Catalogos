import { PrismaClient, type Produto } from '@prisma/client';
import axios from "axios";
const prisma = new PrismaClient();

(async () => {
    const produtosJson = await axios.get("http://localhost:3001/ds");

    for (let i = 0; i < /*produtosJson.length*/ 2; i++) {
        const produtoTemp = produtosJson.data[1]
        const novoProduto: Produto = {
            linha: produtoTemp.linha,
            referencia: produtoTemp.link,
            aplicacoes: produtoTemp.aplicacoes,
            catalogoId: produtoTemp.id,
        }


            console.log(linha)

        /*
        const produto = await prisma.produto.create({
            data: {
                linha: produtosJson[i].linha,
                link: produtosJson[i].link,
                linha: produtosJson[i].linha,
                id: produtosJson[i].id,
                equivalentes: produtosJson[i].equivalentes,
                aplicacoes: produtosJson[i].aplicacoes,
                imagens: produtosJson[i].imagens,
                atributos: produtosJson[i].atributos
            }
        })
        */

    }
})();

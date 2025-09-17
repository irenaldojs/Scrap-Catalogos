export type PRODUTO = {
    id?: string,
    linha?: string,
    referencia?: string,
    link?: string,
    image?: string,
    aplicacoes?: APLICACAO[],
    atributos?: string[],
    imagens?: string[]
}

export type APLICACAO = {
    montadora?: string,
    modelo?: string,
    ano?: string,
    versao?: string
}
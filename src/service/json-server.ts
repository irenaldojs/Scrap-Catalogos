import axios from "axios";
import { PRODUTO } from "../type/produto";

export async function POST(api: string, data: PRODUTO) {
    try {
        const response = await axios.post(api, data);
        //console.log('Dados enviados com sucesso:', response.data);
    } catch (error: Error | any) {
        console.error('Erro ao enviar dados:', error.message);
    }

}

export async function PUT(api: string, data: PRODUTO) {

    try {
        const response = await axios.put(api + '/' + data.id, data);
        //console.log('Dados enviados com sucesso:', response.data);
    } catch (error: Error | any) {
        console.error('Erro ao enviar dados:', error.message);
    }

}

export async function GET(api: string) {
    try {
        const response = await axios.get(api);
        //console.log('Dados enviados com sucesso:', response.data);
        return response.data;
    } catch (error: Error | any) {
        console.error('Erro ao enviar dados:', error.message);
    }
}

export async function POST_AUX(api: string, data: Object) {
    try {
        const response = await axios.post(api, data);
        //console.log('Dados enviados com sucesso:', response.data);
    } catch (error: Error | any) {
        console.error('Erro ao enviar dados:', error.message);
    }
}
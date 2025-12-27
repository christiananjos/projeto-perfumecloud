import { APP_CONFIG } from './config.js';

const _supabase = supabase.createClient(APP_CONFIG.SUPABASE.URL, APP_CONFIG.SUPABASE.KEY);

export const db = {
    async getProdutos() {
        const { data } = await _supabase.from('produtos').select('*').order('nome');
        return data || [];
    },
    async getVendas() {
        const { data } = await _supabase.from('vendas').select('*').order('created_at', { ascending: false });
        return data || [];
    },
    async registrarVenda(venda) {
        return await _supabase.from('vendas').insert([venda]);
    },
    async salvarProduto(produto) {
        if (produto.id) return await _supabase.from('produtos').update(produto).eq('id', produto.id);
        const { id, ...dados } = produto;
        return await _supabase.from('produtos').insert([dados]);
    },
    async excluirProduto(id) {
        return await _supabase.from('produtos').delete().eq('id', id);
    }
};
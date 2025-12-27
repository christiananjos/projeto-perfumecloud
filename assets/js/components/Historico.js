const HistoricoView = {
    template: `
    <div class="animate-fade-in space-y-8 max-w-6xl mx-auto text-primary">
        <h2 class="text-3xl font-bold tracking-tighter px-4 text-slate-900">Histórico de Vendas</h2>
        <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left font-semibold text-sm">
                <thead class="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 border-b">
                    <tr>
                        <th class="py-5 px-6">Data</th>
                        <th class="py-5 px-6">Produto</th>
                        <th class="py-5 px-6">Pedido ML</th>
                        <th class="py-5 px-6">Rastreio</th>
                        <th class="py-5 px-6 text-right">Lucro</th>
                        <th class="py-5 px-6 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="v in vendas" :key="v.id" class="hover:bg-slate-50 transition-colors">
                        <td class="py-5 px-6 text-xs text-gray-400">{{ new Date(v.created_at).toLocaleDateString() }}</td>
                        <td class="py-5 px-6 font-bold text-slate-700">{{ v.nome_produto_snapshot }}</td>
                        <td class="py-5 px-6"><span v-if="v.ml_order_id" class="badge-ml">#{{ v.ml_order_id }}</span></td>
                        <td class="py-5 px-6">
                            <span v-if="v.tracking_code" class="badge-correios">📦 {{ v.tracking_code }}</span>
                        </td>
                        <td class="py-5 px-6 text-right text-emerald-600 font-bold">R$ {{ v.lucro_liquido.toFixed(2) }}</td>
                        <td class="py-5 px-6 text-center">
                            <button @click="remover(v.id)" class="text-red-400 hover:scale-110 transition-all p-2">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!vendas || vendas.length === 0" class="p-20 text-center text-gray-400">Nenhuma venda registrada.</div>
        </div>
    </div>`,
    props: ['vendas'],
    methods: {
        async remover(id) {
            if(confirm("Remover venda?")) {
                await window.supabase.from('vendas').delete().eq('id', id);
                this.$emit('refresh');
            }
        }
    }
};
export default HistoricoView;
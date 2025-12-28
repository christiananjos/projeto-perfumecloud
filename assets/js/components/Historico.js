const HistoricoView = {
    template: `
    <div class="animate-fade-in space-y-8 max-w-6xl mx-auto">
        <div class="flex justify-between items-center px-4">
            <h2 class="text-3xl font-bold tracking-tighter text-slate-900">Histórico de Vendas</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input v-model="busca" type="text" placeholder="Buscar por produto ou código ML..." class="input-soft !pl-12 !text-left">
            </div>
            <div class="flex items-center justify-end text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                Total de registros: {{ vendasFiltradas.length }}
            </div>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left font-semibold text-sm">
                    <thead class="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-5 px-6">Data</th>
                            <th class="py-5 px-6">Produto</th>
                            <th class="py-5 px-6 text-center">Qtd</th>
                            <th class="py-5 px-6">Pedido ML</th>
                            <th class="py-5 px-6">Rastreio</th>
                            <th class="py-5 px-6 text-right">Lucro</th>
                            <th class="py-5 px-6 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="v in paginados" :key="v.id" class="hover:bg-slate-50 transition-colors">
                            <td class="py-5 px-6 text-xs text-gray-400">
                                {{ new Date(v.created_at).toLocaleDateString() }}
                            </td>
                            <td class="py-5 px-6 font-bold text-slate-700">
                                {{ v.nome_produto_snapshot }}
                            </td>
                            <td class="py-5 px-6 text-center">
                                <span class="bg-slate-100 px-2 py-1 rounded-lg text-xs">{{ v.quantidade || 1 }}</span>
                            </td>
                            <td class="py-5 px-6">
                                <span v-if="v.ml_order_id" class="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black border border-orange-100">
                                    #{{ v.ml_order_id }}
                                </span>
                                <span v-else class="text-gray-300 italic text-xs">---</span>
                            </td>
                            <td class="py-5 px-6">
                                <button v-if="v.tracking_code" @click="abrirRastreio(v.tracking_code)" 
                                        class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">
                                    📦 {{ v.tracking_code }}
                                </button>
                                <span v-else class="text-gray-300 italic text-xs">---</span>
                            </td>
                            <td class="py-5 px-6 text-right text-emerald-600 font-bold">
                                R$ {{ (v.lucro_liquido || 0).toFixed(2) }}
                            </td>
                            <td class="py-5 px-6 text-center">
                                <button @click="remover(v.id)" class="text-red-300 hover:text-red-500 transition-all p-2">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="vendasFiltradas.length > 0" class="p-6 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Página {{ paginaAtual }} de {{ totalPaginas }}
                </p>
                <div class="flex gap-2">
                    <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="btn-paginacao">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    <button v-for="p in totalPaginas" :key="p" 
                            @click="paginaAtual = p"
                            :class="paginaAtual === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-200'"
                            class="w-10 h-10 rounded-xl font-bold text-xs transition-all shadow-sm">
                        {{ p }}
                    </button>

                    <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="btn-paginacao">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div v-if="vendasFiltradas.length === 0" class="p-20 text-center text-gray-400 italic font-medium">
                Nenhuma venda encontrada no histórico.
            </div>
        </div>
    </div>`,
    props: ['vendas'],
    data() {
        return {
            busca: '',
            paginaAtual: 1,
            itensPorPagina: 10
        }
    },
    computed: {
        vendasFiltradas() {
            if (!this.vendas) return [];
            const termo = this.busca.toLowerCase();
            return this.vendas.filter(v => 
                v.nome_produto_snapshot.toLowerCase().includes(termo) ||
                (v.ml_order_id && v.ml_order_id.toLowerCase().includes(termo)) ||
                (v.tracking_code && v.tracking_code.toLowerCase().includes(termo))
            );
        },
        totalPaginas() {
            return Math.ceil(this.vendasFiltradas.length / this.itensPorPagina) || 1;
        },
        paginados() {
            const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
            const fim = inicio + this.itensPorPagina;
            return this.vendasFiltradas.slice(inicio, fim);
        }
    },
    methods: {
        abrirRastreio(codigo) {
            window.open(`https://api.linkrastreio.com.br/rastreio?id=${codigo}`, '_blank');
        },
        async remover(id) {
            if(confirm("Deseja realmente excluir este registro de venda? O lucro será removido do dashboard.")) {
                const { error } = await window.supabase.from('vendas').delete().eq('id', id);
                if(!error) {
                    this.$emit('refresh');
                    this.$emit('notificar', { titulo: 'Excluído', texto: 'Venda removida com sucesso.' });
                }
            }
        }
    }
};

export default HistoricoView;
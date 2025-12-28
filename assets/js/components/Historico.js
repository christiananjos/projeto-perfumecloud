const HistoricoView = {
    template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-3 md:space-y-8 pt-2">
        
        <div class="flex justify-between items-center px-4 shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none">Histórico de Vendas</h2>
            <div class="md:hidden text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">
                {{ vendasFiltradas.length }} registros
            </div>
        </div>

        <div class="px-4 shrink-0">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-base"></i>
                <input v-model="busca" type="text" placeholder="Buscar produto, pedido ou rastreio..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm w-full">
            </div>
        </div>

        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mx-2 md:mx-0 mb-2">
            <div class="flex-1 overflow-x-auto overflow-y-hidden">
                <table class="w-full text-left font-semibold text-sm table-fixed min-w-full">
                    <thead class="bg-gray-50 text-[9px] md:text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-3 md:py-5 px-4 md:px-6 w-[18%] md:w-[12%]">Data</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 w-[47%] md:w-[33%]">Produto</th>
                            <th class="py-3 md:py-5 px-6 hidden md:table-cell md:w-[15%]">Pedido ML</th>
                            <th class="py-3 md:py-5 px-6 hidden md:table-cell md:w-[15%]">Rastreio</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right w-[20%] md:w-[15%] text-emerald-600">Lucro</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-center w-[15%] md:w-[10%]">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="v in paginados" :key="v.id" class="hover:bg-slate-50 transition-colors h-[12%] md:h-auto">
                            <td class="py-2 md:py-5 px-4 md:px-6 text-[10px] md:text-xs text-gray-400">
                                {{ new Date(v.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) }}
                            </td>
                            
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col">
                                    <span class="text-slate-700 font-bold truncate leading-tight text-[11px] md:text-sm">
                                        {{ v.nome_produto_snapshot }}
                                    </span>
                                    
                                    <div class="md:hidden flex items-center gap-2 mt-0.5">
                                        <span v-if="v.ml_order_id" class="text-[8px] text-orange-600 font-black uppercase">#{{ v.ml_order_id }}</span>
                                        <button v-if="v.tracking_code" @click="copiarCodigo(v.tracking_code)" 
                                                class="text-[8px] text-blue-500 font-bold flex items-center gap-1 active:text-blue-800">
                                            <i class="fa-solid fa-copy"></i> {{ v.tracking_code }}
                                        </button>
                                    </div>
                                </div>
                            </td>

                            <td class="py-5 px-6 hidden md:table-cell">
                                <span v-if="v.ml_order_id" class="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black border border-orange-100 uppercase">
                                    #{{ v.ml_order_id }}
                                </span>
                                <span v-else class="text-gray-300 italic text-xs">---</span>
                            </td>

                            <td class="py-5 px-6 hidden md:table-cell">
                                <button v-if="v.tracking_code" @click="copiarCodigo(v.tracking_code)" 
                                        class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100 hover:bg-blue-200 transition-all uppercase flex items-center gap-2">
                                    <i class="fa-solid fa-copy"></i> {{ v.tracking_code }}
                                </button>
                                <span v-else class="text-gray-300 italic text-xs">---</span>
                            </td>

                            <td class="py-2 md:py-5 px-4 md:px-6 text-right">
                                <span class="text-emerald-600 font-bold text-xs md:text-sm whitespace-nowrap">
                                    R$ {{ (v.lucro_liquido || 0).toFixed(2) }}
                                </span>
                            </td>

                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <button @click="remover(v.id)" class="text-red-200 hover:text-red-500 transition-all p-2">
                                    <i class="fa-solid fa-trash-can text-xs md:text-base"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="vendasFiltradas.length > 0" class="p-3 md:p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                <span class="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{{ paginaAtual }}/{{ totalPaginas }}</span>
                <div class="flex gap-1 md:gap-2">
                    <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border rounded-xl disabled:opacity-30">
                        <i class="fa-solid fa-chevron-left text-[10px]"></i>
                    </button>
                    <button v-for="p in paginasVisiveis" :key="p" @click="paginaAtual = p"
                            :class="paginaAtual === p ? 'bg-blue-600 text-white shadow-sm border-blue-600' : 'bg-white text-gray-400 border border-gray-200'"
                            class="w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold text-[10px] md:text-xs transition-all">{{ p }}</button>
                    <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border rounded-xl disabled:opacity-30">
                        <i class="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    props: ['vendas'],
    data() {
        return {
            busca: '',
            paginaAtual: 1,
            itensPorPagina: window.innerWidth < 768 ? 7 : 10
        }
    },
    computed: {
        vendasFiltradas() {
            if (!this.vendas) return [];
            const termo = this.busca.toLowerCase();
            return this.vendas.filter(v => {
                const nome = (v.nome_produto_snapshot || "").toLowerCase();
                const pedido = (v.ml_order_id || "").toLowerCase();
                const rastreio = (v.tracking_code || "").toLowerCase();
                return nome.includes(termo) || pedido.includes(termo) || rastreio.includes(termo);
            });
        },
        totalPaginas() { return Math.ceil(this.vendasFiltradas.length / this.itensPorPagina) || 1; },
        paginados() {
            const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
            return this.vendasFiltradas.slice(inicio, inicio + this.itensPorPagina);
        },
        paginasVisiveis() {
            const paginas = [];
            for (let i = Math.max(1, this.paginaAtual - 1); i <= Math.min(this.totalPaginas, this.paginaAtual + 1); i++) {
                paginas.push(i);
            }
            return paginas;
        }
    },
    methods: {
        async copiarCodigo(codigo) {
            try {
                await navigator.clipboard.writeText(codigo);
                this.$emit('notificar', { 
                    titulo: 'Copiado!', 
                    texto: 'Código ' + codigo + ' copiado para a área de transferência.' 
                });
            } catch (err) {
                // Fallback caso o navegador bloqueie o clipboard API
                const input = document.createElement('input');
                input.value = codigo;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                this.$emit('notificar', { titulo: 'Copiado!', texto: 'Código copiado.' });
            }
        },
        async remover(id) {
            if(confirm("Excluir esta venda?")) {
                await window.supabase.from('vendas').delete().eq('id', id);
                this.$emit('refresh');
            }
        }
    }
};

export default HistoricoView;
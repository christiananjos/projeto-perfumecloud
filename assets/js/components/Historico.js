const HistoricoView = {
    template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-3 md:space-y-8 pt-2">
        <div class="flex justify-between items-center px-4 shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none">Histórico</h2>
            <div class="md:hidden text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">{{ vendasFiltradas.length }} registros</div>
        </div>

        <div class="px-4 shrink-0">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-base"></i>
                <input v-model="busca" type="text" placeholder="Buscar produto ou pedido..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm w-full">
            </div>
        </div>

        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mx-2 md:mx-0 mb-2">
            <div class="flex-1 overflow-x-auto overflow-y-hidden">
                <table class="w-full text-left font-semibold text-sm table-fixed min-w-full">
                    <thead class="bg-gray-50 text-[9px] md:text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-5 px-6 w-[18%] md:w-[12%]">Data</th>
                            <th class="py-5 px-6 w-[47%] md:w-[33%]">Produto</th>
                            <th class="py-5 px-6 hidden md:table-cell md:w-[15%]">Mercado Livre</th>
                            <th class="py-5 px-6 hidden md:table-cell md:w-[15%] text-right text-emerald-600">Lucro</th>
                            <th class="py-5 px-6 text-center w-[15%] md:w-[10%]">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="v in paginados" :key="v.id" class="hover:bg-slate-50 transition-colors h-[12%] md:h-auto">
                            <td class="py-2 md:py-5 px-4 md:px-6 text-[10px] md:text-xs text-gray-400">{{ new Date(v.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col">
                                    <span class="text-slate-700 font-bold truncate leading-tight text-[11px] md:text-sm">{{ v.nome_produto_snapshot }}</span>
                                    <div class="md:hidden flex items-center gap-2 mt-1">
                                        <span v-if="v.ml_order_id" class="text-[8px] text-orange-600 font-black flex items-center gap-1"><i class="fa-solid fa-handshake"></i> #{{ v.ml_order_id }}</span>
                                        <button v-if="v.tracking_code" @click="copiarCodigo(v.tracking_code)" class="text-[8px] text-blue-500 font-bold flex items-center gap-1"><i class="fa-solid fa-truck-fast"></i> {{ v.tracking_code }}</button>
                                    </div>
                                </div>
                            </td>
                            <td class="py-5 px-6 hidden md:table-cell"><span v-if="v.ml_order_id" class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black border border-yellow-200 uppercase flex items-center w-fit gap-1.5"><i class="fa-solid fa-handshake"></i> #{{ v.ml_order_id }}</span></td>
                            <td class="py-5 px-6 hidden md:table-cell text-right text-emerald-600 font-bold">R$ {{ (v.lucro_liquido || 0).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <button @click="userRole === 'admin' ? remover(v.id) : null" :class="userRole === 'admin' ? 'text-red-200' : 'text-gray-50 cursor-not-allowed'" :title="userRole === 'admin' ? 'Remover' : 'Sem permissão'"><i class="fa-solid fa-trash-can"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                <span class="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{{ paginaAtual }}/{{ totalPaginas }}</span>
                <div class="flex gap-2"><button @click="paginaAtual--" :disabled="paginaAtual === 1" class="w-8 h-8 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-left text-xs"></i></button><button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="w-8 h-8 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-right text-xs"></i></button></div>
            </div>
        </div>
    </div>`,
    props: ['vendas', 'userRole'],
    data() { return { busca: '', paginaAtual: 1, itensPorPagina: window.innerWidth < 768 ? 7 : 10 } },
    computed: {
        vendasFiltradas() {
            const t = this.busca.toLowerCase();
            return this.vendas.filter(v => (v.nome_produto_snapshot || "").toLowerCase().includes(t) || (v.ml_order_id || "").toLowerCase().includes(t) || (v.tracking_code || "").toLowerCase().includes(t));
        },
        totalPaginas() { return Math.ceil(this.vendasFiltradas.length / this.itensPorPagina) || 1; },
        paginados() { return this.vendasFiltradas.slice((this.paginaAtual - 1) * this.itensPorPagina, this.paginaAtual * this.itensPorPagina); }
    },
    methods: {
        copiarCodigo(c) { navigator.clipboard.writeText(c); this.$emit('notificar', { titulo: 'Copiado!', texto: 'Código copiado.' }); },
        async remover(id) { if(confirm("Excluir venda?")) { await window.supabase.from('vendas').delete().eq('id', id); this.$emit('refresh'); } }
    }
};

export default HistoricoView;
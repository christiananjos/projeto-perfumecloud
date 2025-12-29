const EstoqueView = {
    template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-3 md:space-y-8 pt-2">
        
        <div class="flex justify-between items-center px-4 shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none">Gestão de Estoque</h2>
            <button @click="abrirModal()" class="btn-primary uppercase text-[9px] md:text-xs tracking-widest font-bold px-4 py-2 md:py-4">
                <i class="fa-solid fa-plus mr-1 md:mr-2"></i> Novo Produto
            </button>
        </div>

        <div class="grid grid-cols-2 gap-2 px-4 shrink-0">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-base"></i>
                <input v-model="filtros.busca" type="text" placeholder="Nome..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm w-full">
            </div>
            <div class="relative">
                <i class="fa-solid fa-hand-holding-dollar absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-orange-400 text-xs md:text-base"></i>
                <input v-model.number="filtros.precoMax" type="number" placeholder="Até R$..." class="input-soft !pl-9 md:!pl-12 !py-2 md:!py-4 !text-xs md:!text-sm border-orange-100 w-full">
            </div>
        </div>

        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mx-2 md:mx-0 mb-2">
            <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left font-semibold text-xs md:text-sm table-fixed min-w-full">
                    <thead class="bg-gray-50 text-[9px] md:text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-3 md:py-5 px-4 md:px-6 w-[45%] md:w-[35%]">Produto</th>
                            <th class="py-3 md:py-5 px-6 hidden md:table-cell md:w-[20%]">Inspiração</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right w-[20%] md:w-[15%]">Custo</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right text-orange-600 w-[20%] md:w-[15%]">Venda ML</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-center w-[15%] md:w-32">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in paginados" :key="p.id" class="hover:bg-slate-50 transition-colors">
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col">
                                    <span class="text-slate-700 font-bold truncate leading-tight">{{ p.nome }}</span>
                                    <span v-if="p.inspiracao" class="md:hidden text-[8px] text-slate-400 font-medium truncate uppercase tracking-tighter">{{ p.inspiracao }}</span>
                                </div>
                            </td>
                            <td class="py-5 px-6 hidden md:table-cell font-medium text-slate-500 uppercase text-[10px]">{{ p.inspiracao || '-' }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-slate-400 font-bold">R$ {{ Number(p.custo).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-orange-600 font-bold">R$ {{ Number(p.preco_suger_ml).toFixed(2) }}</td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="userRole === 'admin' ? abrirModal(p) : null" 
                                            :class="userRole === 'admin' ? 'text-blue-400 hover:text-blue-600' : 'text-gray-200 cursor-not-allowed'">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button @click="userRole === 'admin' ? excluir(p.id) : null" 
                                            :class="userRole === 'admin' ? 'text-red-200 hover:text-red-500' : 'text-gray-100 cursor-not-allowed'">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="p-3 md:p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                <span class="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{{ produtosFiltrados.length }} itens</span>
                <div class="flex gap-1">
                    <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="w-8 h-8 md:w-10 md:h-10 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
                    <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="w-8 h-8 md:w-10 md:h-10 border rounded-xl flex items-center justify-center disabled:opacity-30"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
                </div>
            </div>
        </div>

        <div v-if="modal.aberto" class="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in text-left">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-black text-slate-900 tracking-tighter">{{ modoEdicao ? 'Ajustar Produto' : 'Novo Produto' }}</h3>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Margem Sugerida: 30% + Taxa ML</p>
                </div>
                
                <div class="space-y-4">
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Nome do Produto</label>
                        <input v-model="form.nome" type="text" class="input-soft" placeholder="Ex: Invictus 100ml">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Inspiração</label>
                        <input v-model="form.inspiracao" type="text" class="input-soft" placeholder="Ex: Paco Rabanne">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-blue-500 uppercase ml-2 italic">Preço de Custo</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-300">R$</span>
                                <input v-model.number="form.custo" type="number" step="0.01" @input="autoCalcularSugerido" class="input-soft !pl-10 border-blue-100 font-bold">
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-orange-400 uppercase ml-2 italic">Venda ML (Sugerido)</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-300">R$</span>
                                <input v-model.number="form.preco_suger_ml" type="number" step="0.01" class="input-soft !pl-10 border-orange-100 text-orange-600 font-bold">
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 text-center">
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            Lucro Previsto: <span class="text-green-600">R$ {{ (form.custo * 0.30).toFixed(2) }}</span> (30%)
                        </p>
                    </div>
                </div>

                <div class="flex gap-4 mt-8">
                    <button @click="fecharModal" class="flex-1 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Cancelar</button>
                    <button @click="salvar" class="flex-1 btn-primary text-xs uppercase font-black">Salvar Alterações</button>
                </div>
            </div>
        </div>
    </div>`,
    props: ['produtos', 'userRole'],
    data() {
        return {
            paginaAtual: 1, 
            itensPorPagina: window.innerWidth < 768 ? 6 : 10,
            filtros: { busca: '', precoMax: null }, 
            modal: { aberto: false },
            modoEdicao: false, 
            idSendoEditado: null,
            form: { nome: '', inspiracao: '', custo: 0, preco_suger_ml: 0 }
        }
    },
    computed: {
        produtosFiltrados() {
            if (!this.produtos) return [];
            const t = this.filtros.busca.toLowerCase();
            return this.produtos.filter(p => {
                const bN = p.nome.toLowerCase().includes(t) || (p.inspiracao && p.inspiracao.toLowerCase().includes(t));
                const bP = !this.filtros.precoMax || Number(p.preco_suger_ml) <= Number(this.filtros.precoMax);
                return bN && bP;
            });
        },
        totalPaginas() { return Math.ceil(this.produtosFiltrados.length / this.itensPorPagina) || 1; },
        paginados() { return this.produtosFiltrados.slice((this.paginaAtual - 1) * this.itensPorPagina, this.paginaAtual * this.itensPorPagina); }
    },
    methods: {
        autoCalcularSugerido() {
            const taxaML = parseFloat(localStorage.getItem('taxaMLFixa') || 60);
            if (this.form.custo > 0) {
                // FÓRMULA: Custo + 30% de Lucro + Taxa Fixa ML
                const lucroAlvo = this.form.custo * 0.30;
                const totalSugerido = this.form.custo + lucroAlvo + taxaML;
                this.form.preco_suger_ml = Number(totalSugerido.toFixed(2));
            }
        },
        abrirModal(p = null) {
            if (p) { 
                if(this.userRole !== 'admin') return; 
                this.modoEdicao = true; 
                this.idSendoEditado = p.id; 
                this.form = { ...p }; 
            } else { 
                this.modoEdicao = false; 
                this.idSendoEditado = null; 
                this.form = { nome: '', inspiracao: '', custo: 0, preco_suger_ml: 0 }; 
            }
            this.modal.aberto = true;
        },
        fecharModal() { this.modal.aberto = false; },
        async salvar() {
            if(!this.form.nome) return;
            const payload = { ...this.form }; 
            delete payload.id;
            if (this.modoEdicao) await window.supabase.from('produtos').update(payload).eq('id', this.idSendoEditado);
            else await window.supabase.from('produtos').insert([payload]);
            this.$emit('refresh'); 
            this.fecharModal();
            this.$emit('notificar', { titulo: 'Sucesso', texto: 'Dados atualizados.' });
        },
        async excluir(id) { 
            if (confirm("Deseja realmente excluir este item?")) { 
                await window.supabase.from('produtos').delete().eq('id', id); 
                this.$emit('refresh'); 
            } 
        }
    }
};

export default EstoqueView;
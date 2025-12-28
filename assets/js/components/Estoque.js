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
            <div class="flex-1 overflow-x-auto overflow-y-hidden">
                <table class="w-full text-left font-semibold text-xs md:text-sm table-fixed min-w-full">
                    <thead class="bg-gray-50 text-[9px] md:text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-3 md:py-5 px-4 md:px-6 w-[45%] md:w-[35%]">Produto</th>
                            <th class="py-3 md:py-5 px-6 hidden md:table-cell md:w-[20%]">Inspiração</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right w-[20%] md:w-[15%]">Custo</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-right text-orange-600 w-[20%] md:w-[15%]">Venda</th>
                            <th class="py-3 md:py-5 px-4 md:px-6 text-center w-[15%] md:w-32">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in paginados" :key="p.id" class="hover:bg-slate-50 transition-colors h-[12%] md:h-auto">
                            <td class="py-2 md:py-5 px-4 md:px-6">
                                <div class="flex flex-col">
                                    <span class="text-slate-700 font-bold truncate leading-tight">{{ p.nome }}</span>
                                    <span v-if="p.inspiracao" class="md:hidden text-[8px] text-slate-400 font-medium truncate uppercase tracking-tighter">
                                        {{ p.inspiracao }}
                                    </span>
                                </div>
                            </td>
                            
                            <td class="py-5 px-6 hidden md:table-cell">
                                <span v-if="p.inspiracao" class="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-full uppercase font-bold whitespace-nowrap">
                                    {{ p.inspiracao }}
                                </span>
                                <span v-else class="text-gray-300 italic text-xs">---</span>
                            </td>

                            <td class="py-2 md:py-5 px-4 md:px-6 text-right text-slate-400">
                                <span class="font-bold">R$ {{ Number(p.custo).toFixed(2) }}</span>
                            </td>

                            <td class="py-2 md:py-5 px-4 md:px-6 text-right">
                                <span class="text-orange-600 font-bold">R$ {{ Number(p.preco_suger_ml).toFixed(2) }}</span>
                            </td>
                            <td class="py-2 md:py-5 px-4 md:px-6 text-center">
                                <div class="flex items-center justify-center gap-2 md:gap-3">
                                    <button @click="abrirModal(p)" class="text-blue-400 hover:text-blue-600 transition-all"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button @click="excluir(p.id)" class="text-red-200 hover:text-red-500 transition-all"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="produtosFiltrados.length > 0" class="p-3 md:p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                <span class="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {{ produtosFiltrados.length }} produtos
                </span>
                
                <div class="flex gap-1 md:gap-2">
                    <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border rounded-xl disabled:opacity-30">
                        <i class="fa-solid fa-chevron-left text-[10px]"></i>
                    </button>
                    
                    <button v-for="p in paginasVisiveis" :key="p" 
                            @click="paginaAtual = p"
                            :class="paginaAtual === p ? 'bg-blue-600 text-white shadow-sm border-blue-600' : 'bg-white text-gray-400 border border-gray-200'"
                            class="w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold text-[10px] md:text-xs transition-all">
                        {{ p }}
                    </button>

                    <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border rounded-xl disabled:opacity-30">
                        <i class="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modal.aberto" class="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in">
                <h3 class="text-2xl font-bold mb-6 text-center text-slate-900 tracking-tighter">
                    {{ modoEdicao ? 'Editar Perfume' : 'Novo Perfume' }}
                </h3>
                <div class="space-y-4">
                    <div class="space-y-1 text-left">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Nome do Produto</label>
                        <input v-model="form.nome" type="text" class="input-soft">
                    </div>
                    <div class="space-y-1 text-left">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Inspiração</label>
                        <input v-model="form.inspiracao" type="text" class="input-soft">
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-left">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Custo</label>
                            <input v-model.number="form.custo" type="number" step="0.01" class="input-soft">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-orange-400 uppercase ml-2">Sugerido</label>
                            <input v-model.number="form.preco_suger_ml" type="number" step="0.01" class="input-soft border-orange-100 text-orange-600 font-bold">
                        </div>
                    </div>
                </div>
                <div class="flex gap-4 mt-8">
                    <button @click="fecharModal" class="flex-1 font-bold text-gray-400 uppercase text-xs">Cancelar</button>
                    <button @click="salvar" class="flex-1 btn-primary text-xs">SALVAR</button>
                </div>
            </div>
        </div>
    </div>`,
    props: ['produtos'],
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
    watch: {
        'filtros.busca'() { this.paginaAtual = 1; },
        'filtros.precoMax'() { this.paginaAtual = 1; }
    },
    computed: {
        produtosFiltrados() {
            if (!this.produtos) return [];
            const termo = this.filtros.busca.toLowerCase();
            return this.produtos.filter(p => {
                const bateNome = p.nome.toLowerCase().includes(termo) || (p.inspiracao && p.inspiracao.toLowerCase().includes(termo));
                const batePreco = !this.filtros.precoMax || Number(p.preco_suger_ml) <= Number(this.filtros.precoMax);
                return bateNome && batePreco;
            });
        },
        totalPaginas() {
            return Math.ceil(this.produtosFiltrados.length / this.itensPorPagina) || 1;
        },
        paginados() {
            const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
            return this.produtosFiltrados.slice(inicio, inicio + this.itensPorPagina);
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
        abrirModal(p = null) {
            if (p) {
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
            if (this.modoEdicao) {
                await window.supabase.from('produtos').update(payload).eq('id', this.idSendoEditado);
            } else {
                await window.supabase.from('produtos').insert([payload]);
            }
            this.$emit('refresh');
            this.fecharModal();
            this.$emit('notificar', { titulo: 'Sucesso', texto: 'Dados salvos.' });
        },
        async excluir(id) {
            if (confirm("Excluir item?")) {
                await window.supabase.from('produtos').delete().eq('id', id);
                this.$emit('refresh');
            }
        }
    }
};

export default EstoqueView;
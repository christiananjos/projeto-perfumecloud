const EstoqueView = {
    template: `
    <div class="animate-fade-in space-y-6 max-w-6xl mx-auto px-2 md:px-4">
        <div class="flex justify-between items-center px-2">
            <h2 class="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900">Estoque</h2>
            <button @click="abrirModal()" class="btn-primary uppercase text-[10px] md:text-xs tracking-widest font-bold px-4 py-3">
                <i class="fa-solid fa-plus mr-1 md:mr-2"></i> Novo
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 px-2">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input v-model="filtros.busca" type="text" placeholder="Nome ou inspiração..." class="input-soft !pl-12 !text-left w-full">
            </div>

            <div class="relative">
                <i class="fa-solid fa-hand-holding-dollar absolute left-5 top-1/2 -translate-y-1/2 text-orange-400"></i>
                <input v-model.number="filtros.precoMax" type="number" placeholder="Preço Máximo de Venda (R$)..." class="input-soft !pl-12 !text-left w-full border-orange-100 focus:border-orange-300">
            </div>
        </div>

        <div class="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div class="w-full overflow-hidden">
                <table class="w-full text-left font-semibold text-sm table-fixed">
                    <thead class="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 border-b">
                        <tr>
                            <th class="py-4 px-4 md:px-6 w-[55%] md:w-auto">Produto</th>
                            <th class="py-4 px-2 text-right hidden md:table-cell">Custo</th>
                            <th class="py-4 px-4 text-right text-orange-600 w-[25%] md:w-auto">Venda</th>
                            <th class="py-4 px-4 text-center w-[20%] md:w-32">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in paginados" :key="p.id" class="hover:bg-slate-50 transition-colors">
                            <td class="py-4 px-4 md:px-6">
                                <div class="flex flex-col">
                                    <span class="text-slate-700 font-bold truncate leading-tight">{{ p.nome }}</span>
                                    <span v-if="p.inspiracao" class="text-[9px] text-slate-400 font-medium truncate uppercase tracking-tighter">
                                        {{ p.inspiracao }}
                                    </span>
                                </div>
                            </td>
                            <td class="py-4 px-2 text-right text-slate-400 hidden md:table-cell">
                                R$ {{ Number(p.custo).toFixed(2) }}
                            </td>
                            <td class="py-4 px-4 text-right">
                                <div class="flex flex-col items-end">
                                    <span class="text-orange-600 font-bold">R$ {{ Number(p.preco_suger_ml).toFixed(2) }}</span>
                                    <span class="md:hidden text-[8px] text-slate-300 font-normal uppercase">Sugerido</span>
                                </div>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <div class="flex items-center justify-center gap-2 md:gap-3">
                                    <button @click="abrirModal(p)" class="text-blue-400 hover:text-blue-600">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button @click="excluir(p.id)" class="text-red-200 hover:text-red-500">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="produtosFiltrados.length > 0" class="p-4 md:p-6 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {{ produtosFiltrados.length }} produtos encontrados
                </p>
                <div class="flex gap-1 md:gap-2">
                    <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="btn-paginacao !w-8 !h-8">
                        <i class="fa-solid fa-chevron-left text-[10px]"></i>
                    </button>
                    <button v-for="p in paginasVisiveis" :key="p" 
                            @click="paginaAtual = p"
                            :class="paginaAtual === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200'"
                            class="w-8 h-8 rounded-lg font-bold text-[10px] transition-all">
                        {{ p }}
                    </button>
                    <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="btn-paginacao !w-8 !h-8">
                        <i class="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modal.aberto" class="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in">
                <h3 class="text-xl md:text-2xl font-bold mb-6 text-center text-slate-900">
                    {{ modoEdicao ? 'Editar Perfume' : 'Novo Perfume' }}
                </h3>
                <div class="space-y-4 text-left">
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Nome do Produto</label>
                        <input v-model="form.nome" type="text" class="input-soft">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Inspiração</label>
                        <input v-model="form.inspiracao" type="text" class="input-soft">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Custo</label>
                            <input v-model.number="form.custo" type="number" step="0.01" class="input-soft">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-orange-400 uppercase ml-2">Venda Suger.</label>
                            <input v-model.number="form.preco_suger_ml" type="number" step="0.01" class="input-soft border-orange-100 text-orange-600 font-bold">
                        </div>
                    </div>
                </div>
                <div class="flex gap-4 mt-8">
                    <button @click="fecharModal" class="flex-1 font-bold text-gray-400 uppercase text-[10px]">Cancelar</button>
                    <button @click="salvar" class="flex-1 btn-primary text-[10px]">SALVAR</button>
                </div>
            </div>
        </div>
    </div>`,
    props: ['produtos'],
    data() {
        return {
            paginaAtual: 1,
            itensPorPagina: 10,
            filtros: { 
                busca: '',
                precoMax: null // Começa vazio para mostrar tudo
            },
            modal: { aberto: false },
            modoEdicao: false,
            idSendoEditado: null,
            form: { nome: '', inspiracao: '', custo: 0, preco_suger_ml: 0 }
        }
    },
    watch: {
        'form.custo'(v) {
            if(!this.modoEdicao && v > 0) {
                this.form.preco_suger_ml = parseFloat((v * 1.30 + 60).toFixed(2));
            }
        },
        'filtros.busca'() { this.paginaAtual = 1; },
        'filtros.precoMax'() { this.paginaAtual = 1; }
    },
    computed: {
        produtosFiltrados() {
            if (!this.produtos) return [];
            const termo = this.filtros.busca.toLowerCase();
            return this.produtos.filter(p => {
                const bateNome = p.nome.toLowerCase().includes(termo) || (p.inspiracao && p.inspiracao.toLowerCase().includes(termo));
                // Se o campo estiver vazio, não filtra por preço
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
            this.$emit('notificar', { titulo: 'Sucesso', texto: 'Estoque atualizado.' });
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
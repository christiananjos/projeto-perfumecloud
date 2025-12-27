const EstoqueView = {
    template: `
    <div class="animate-fade-in space-y-8 max-w-6xl mx-auto">
        <div class="flex justify-between items-center px-4">
            <h2 class="text-3xl font-bold tracking-tighter text-slate-900">Estoque</h2>
            <button @click="abrirModalCadastro" class="btn-primary uppercase text-xs tracking-widest font-bold">
                <i class="fa-solid fa-plus mr-2"></i> Novo Perfume
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input v-model="filtros.busca" type="text" placeholder="Nome ou inspiração..." class="input-soft !pl-12 !text-left">
            </div>
            <div class="relative">
                <i class="fa-solid fa-filter absolute left-5 top-1/2 -translate-y-1/2 text-orange-400"></i>
                <input v-model.number="filtros.precoMax" type="number" placeholder="Preço Sugerido até (R$)..." class="input-soft !pl-12 !text-left border-orange-100">
            </div>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left font-semibold text-sm">
                <thead class="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 border-b">
                    <tr>
                        <th class="py-5 px-6">Produto</th>
                        <th class="py-5 px-6">Inspiração</th>
                        <th class="py-5 px-6 text-right">Custo Unit.</th>
                        <th class="py-5 px-6 text-right text-orange-600">Sugerido ML</th>
                        <th class="py-5 px-6 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="p in produtosFiltrados" :key="p.id" class="hover:bg-slate-50 transition-colors">
                        <td class="py-5 px-6 text-slate-700 font-bold">{{ p.nome }}</td>
                        <td class="py-5 px-6">
                            <span v-if="p.inspiracao" class="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-full uppercase font-bold">
                                {{ p.inspiracao }}
                            </span>
                            <span v-else class="text-gray-300 italic text-xs">---</span>
                        </td>
                        <td class="py-5 px-6 text-right text-slate-400">R$ {{ Number(p.custo).toFixed(2) }}</td>
                        <td class="py-5 px-6 text-right text-orange-600 font-bold">R$ {{ Number(p.preco_suger_ml).toFixed(2) }}</td>
                        <td class="py-5 px-6 text-center space-x-3">
                            <button @click="editar(p)" class="text-blue-400 hover:text-blue-600 transition-all">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button @click="excluir(p.id)" class="text-red-300 hover:text-red-500 transition-all">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="produtosFiltrados.length === 0" class="p-20 text-center">
                <p class="text-gray-400 italic">Nenhum perfume encontrado.</p>
            </div>
        </div>

        <div v-if="modal.aberto" class="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-fade-in">
                <h3 class="text-2xl font-bold mb-6 text-center text-slate-900">
                    {{ modoEdicao ? 'Editar Perfume' : 'Novo Perfume' }}
                </h3>
                
                <div class="space-y-4">
                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Nome do Produto</label>
                        <input v-model="form.nome" type="text" placeholder="Ex: Invictus Platinum" class="input-soft">
                    </div>

                    <div class="space-y-1">
                        <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Inspiração (Opcional)</label>
                        <input v-model="form.inspiracao" type="text" placeholder="Ex: Paco Rabanne" class="input-soft">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-gray-400 uppercase ml-2">Custo Unit.</label>
                            <input v-model.number="form.custo" type="number" step="0.01" class="input-soft">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-bold text-orange-400 uppercase ml-2">Sugerido ML</label>
                            <input v-model.number="form.preco_suger_ml" type="number" step="0.01" class="input-soft border-orange-100">
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 mt-8">
                    <button @click="fecharModal" class="flex-1 font-bold text-gray-400 uppercase text-xs">Cancelar</button>
                    <button @click="salvar" class="flex-1 btn-primary text-xs">
                        {{ modoEdicao ? 'ATUALIZAR' : 'CADASTRAR' }}
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    props: ['produtos'],
    data() {
        return {
            filtros: { busca: '', precoMax: null },
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
        }
    },
    computed: {
        produtosFiltrados() {
            if (!this.produtos || !Array.isArray(this.produtos)) return [];
            return this.produtos.filter(p => {
                const termo = this.filtros.busca.toLowerCase();
                const matchBusca = p.nome.toLowerCase().includes(termo) || 
                                  (p.inspiracao && p.inspiracao.toLowerCase().includes(termo));
                const matchPreco = !this.filtros.precoMax || p.preco_suger_ml <= this.filtros.precoMax;
                return matchBusca && matchPreco;
            });
        }
    },
    methods: {
        abrirModalCadastro() {
            this.modoEdicao = false;
            this.idSendoEditado = null;
            this.form = { nome: '', inspiracao: '', custo: 0, preco_suger_ml: 0 };
            this.modal.aberto = true;
        },
        editar(p) {
            this.modoEdicao = true;
            this.idSendoEditado = p.id;
            this.form = { ...p };
            this.modal.aberto = true;
        },
        fecharModal() { this.modal.aberto = false; },
        async salvar() {
            if(!this.form.nome) return alert("O nome é obrigatório.");
            try {
                if (this.modoEdicao) {
                    const { error } = await window.supabase.from('produtos').update(this.form).eq('id', this.idSendoEditado);
                    if (error) throw error;
                } else {
                    const { error } = await window.supabase.from('produtos').insert([this.form]);
                    if (error) throw error;
                }
                this.fecharModal();
                this.$emit('refresh');
                this.$emit('notificar', { titulo: 'Sucesso!', texto: 'Dados salvos no estoque.' });
            } catch (e) {
                alert("Erro ao salvar: " + e.message);
            }
        },
        async excluir(id) {
            if (confirm("Remover este perfume?")) {
                const { error } = await window.supabase.from('produtos').delete().eq('id', id);
                if (!error) this.$emit('refresh');
            }
        }
    }
};

export default EstoqueView;
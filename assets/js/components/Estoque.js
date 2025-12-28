const EstoqueView = {
    template: `
    <div class="animate-fade-in space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 class="text-3xl font-bold tracking-tighter text-slate-900">Gestão de Estoque</h2>
            <button @click="abrirModal()" class="btn-primary flex items-center gap-2">
                <i class="fa-solid fa-plus"></i> Novo Perfume
            </button>
        </div>

        <div class="card grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm border border-gray-100">
            <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input v-model="filtros.busca" type="text" placeholder="Buscar perfume ou inspiração..." class="input-soft !pl-12">
            </div>
            <div class="relative">
                <i class="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <select v-model="filtros.ordenacao" class="input-soft !pl-12">
                    <option value="nome">Ordenar por Nome</option>
                    <option value="preco_venda">Menor Preço</option>
                    <option value="preco_venda_desc">Maior Preço</option>
                </select>
            </div>
            <div class="flex items-center gap-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Preço Máx:</span>
                <input type="range" v-model="filtros.precoMax" min="0" max="1000" class="flex-1 accent-blue-600">
                <span class="font-bold text-blue-600 text-sm">R$ {{ filtros.precoMax }}</span>
            </div>
        </div>

        <div class="card p-0 overflow-hidden shadow-xl border border-gray-100">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-gray-100">
                            <th class="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perfume</th>
                            <th class="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Custo</th>
                            <th class="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Venda Suger.</th>
                            <th class="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="p in produtosPaginados" :key="p.id" class="hover:bg-blue-50/30 transition-colors group">
                            <td class="p-6">
                                <p class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{{ p.nome }}</p>
                                <p class="text-xs text-slate-400 font-medium italic">Inspiração: {{ p.inspiracao || 'N/A' }}</p>
                            </td>
                            <td class="p-6 text-center font-medium text-slate-600">R$ {{ p.custo.toFixed(2) }}</td>
                            <td class="p-6 text-center">
                                <span class="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-100">
                                    R$ {{ p.preco_suger_ml.toFixed(2) }}
                                </span>
                            </td>
                            <td class="p-6 text-right space-x-2">
                                <button @click="abrirModal(p)" class="text-slate-400 hover:text-blue-600 p-2"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button @click="excluir(p.id)" class="text-slate-400 hover:text-red-500 p-2"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="p-6 bg-slate-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-sm text-slate-500 font-medium">
                    Mostrando {{ produtosPaginados.length }} de {{ produtosFiltrados.length }} produtos
                </p>
                <div class="flex items-center gap-2">
                    <button @click="pagina--" :disabled="pagina === 1" class="btn-pagination">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <span v-for="n in totalPaginas" :key="n" 
                          @click="pagina = n"
                          :class="pagina === n ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-gray-100 border border-gray-200'"
                          class="w-10 h-10 flex items-center justify-center rounded-xl font-bold cursor-pointer transition-all">
                        {{ n }}
                    </span>
                    <button @click="pagina++" :disabled="pagina === totalPaginas" class="btn-pagination">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modal.aberto" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="modal.aberto = false"></div>
            <div class="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl animate-scale-in">
                <h3 class="text-2xl font-bold text-slate-900 mb-8 tracking-tighter">
                    {{ modal.form.id ? 'Editar Perfume' : 'Novo Perfume' }}
                </h3>
                <div class="space-y-6">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Nome do Perfume</label>
                        <input v-model="modal.form.nome" type="text" class="input-soft" placeholder="Ex: Sauvage Elixir">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Inspiração Original</label>
                        <input v-model="modal.form.inspiracao" type="text" class="input-soft" placeholder="Ex: Dior">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-4">Preço de Custo (R$)</label>
                        <input v-model.number="modal.form.custo" type="number" step="0.01" class="input-soft">
                    </div>
                    <div class="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex justify-between items-center">
                        <span class="text-xs font-bold text-emerald-600 uppercase">Preço de Venda Sugerido:</span>
                        <span class="text-xl font-black text-emerald-700">R$ {{ precoSugeridoCalculado }}</span>
                    </div>
                    <button @click="salvar" class="btn-primary w-full py-5 text-lg uppercase tracking-widest shadow-blue-200">
                        {{ modal.form.id ? 'Atualizar Estoque' : 'Cadastrar Perfume' }}
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    props: ['produtos'],
    data() {
        return {
            pagina: 1,
            itensPorPagina: 8,
            filtros: {
                busca: '',
                ordenacao: 'nome',
                precoMax: 1000
            },
            modal: {
                aberto: false,
                form: { id: null, nome: '', inspiracao: '', custo: 0 }
            }
        }
    },
    computed: {
        precoSugeridoCalculado() {
            // Fórmula: (Custo * 1.30) + 60
            return ((this.modal.form.custo * 1.30) + 60).toFixed(2);
        },
        produtosFiltrados() {
            let lista = [...this.produtos];
            
            // Filtro de Busca
            if (this.filtros.busca) {
                const b = this.filtros.busca.toLowerCase();
                lista = lista.filter(p => 
                    p.nome.toLowerCase().includes(b) || 
                    (p.inspiracao && p.inspiracao.toLowerCase().includes(b))
                );
            }

            // Filtro de Preço Máximo
            lista = lista.filter(p => p.preco_suger_ml <= this.filtros.precoMax);

            // Ordenação
            lista.sort((a, b) => {
                if (this.filtros.ordenacao === 'nome') return a.nome.localeCompare(b.nome);
                if (this.filtros.ordenacao === 'preco_venda') return a.preco_suger_ml - b.preco_suger_ml;
                if (this.filtros.ordenacao === 'preco_venda_desc') return b.preco_suger_ml - a.preco_suger_ml;
                return 0;
            });

            return lista;
        },
        totalPaginas() {
            return Math.ceil(this.produtosFiltrados.length / this.itensPorPagina);
        },
        produtosPaginados() {
            const inicio = (this.pagina - 1) * this.itensPorPagina;
            const fim = inicio + this.itensPorPagina;
            return this.produtosFiltrados.slice(inicio, fim);
        }
    },
    methods: {
        abrirModal(produto = null) {
            if (produto) {
                this.modal.form = { ...produto };
            } else {
                this.modal.form = { id: null, nome: '', inspiracao: '', custo: 0 };
            }
            this.modal.aberto = true;
        },
        async salvar() {
            const payload = {
                nome: this.modal.form.nome,
                inspiracao: this.modal.form.inspiracao,
                custo: this.modal.form.custo,
                preco_suger_ml: parseFloat(this.precoSugeridoCalculado)
            };

            let error;
            if (this.modal.form.id) {
                const res = await window.supabase.from('produtos').update(payload).eq('id', this.modal.form.id);
                error = res.error;
            } else {
                const res = await window.supabase.from('produtos').insert([payload]);
                error = res.error;
            }

            if (!error) {
                this.$emit('notificar', { titulo: 'Sucesso!', texto: 'Estoque atualizado com sucesso.' });
                this.modal.aberto = false;
                this.$emit('refresh');
            }
        },
        async excluir(id) {
            if (confirm("Tem certeza que deseja remover este item?")) {
                const { error } = await window.supabase.from('produtos').delete().eq('id', id);
                if (!error) {
                    this.$emit('notificar', { titulo: 'Removido', texto: 'O item saiu do seu estoque.' });
                    this.$emit('refresh');
                }
            }
        }
    }
};

export default EstoqueView;
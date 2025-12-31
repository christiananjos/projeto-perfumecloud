const ConfiguracoesView = {
    template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-4xl h-[92vh] md:h-auto space-y-6 pt-2 px-4">
        <div class="flex flex-col shrink-0 text-left">
            <h2 class="text-xl md:text-2xl font-black tracking-tighter text-slate-900">Ajustes do Sistema</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configurações globais de taxas e fretes</p>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-10 space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                
                <div class="space-y-3 text-left">
                    <div class="flex items-center gap-2 ml-2">
                        <i class="fa-solid fa-percent text-orange-400 text-[10px]"></i>
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comissão Mercado Livre</label>
                    </div>
                    <div class="relative">
                        <input v-model.number="localTaxas.ml_comissao" type="number" :disabled="userRole !== 'admin'" 
                               class="input-soft !py-4 !text-xl !font-bold border-slate-100 focus:border-orange-200">
                        <span class="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">%</span>
                    </div>
                </div>

                <div class="space-y-3 text-left">
                    <div class="flex items-center gap-2 ml-2">
                        <i class="fa-solid fa-truck-fast text-blue-400 text-[10px]"></i>
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Frete Fixo Padrão</label>
                    </div>
                    <div class="relative">
                        <input v-model.number="localTaxas.ml_frete" type="number" step="0.01" :disabled="userRole !== 'admin'" 
                               class="input-soft !py-4 !text-xl !font-bold border-slate-100 focus:border-blue-200 !pl-12">
                        <span class="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300 italic">R$</span>
                    </div>
                </div>
            </div>

            <hr class="border-slate-50">

            <div class="flex flex-col items-center gap-4">
                <button v-if="userRole === 'admin'" @click="salvarNoBanco" 
                        class="btn-primary w-full md:w-auto md:min-w-[220px] py-4 text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Atualizar Taxas Globais
                </button>
                <div v-else class="flex items-center gap-2 text-red-400">
                    <i class="fa-solid fa-lock text-[10px]"></i>
                    <span class="text-[9px] font-bold uppercase tracking-widest">Acesso restrito ao administrador</span>
                </div>
            </div>
        </div>

        <div class="bg-slate-900 rounded-[1.5rem] p-5 flex items-center gap-4 border border-slate-800 shrink-0">
            <div class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <i class="fa-solid fa-triangle-exclamation text-yellow-400 text-xs"></i>
            </div>
            <p class="text-[10px] text-slate-400 font-medium leading-relaxed text-left">
                Atenção: Ao salvar, o cálculo de <b class="text-white">Preço Sugerido</b> em novos produtos será atualizado imediatamente para toda a equipa.
            </p>
        </div>
    </div>`,
    props: ['userRole', 'taxas'],
    data() {
        return {
            localTaxas: { ...this.taxas }
        }
    },
    methods: {
        async salvarNoBanco() {
            if(this.userRole !== 'admin') return;
            try {
                // Atualizar Comissão
                await window.supabase.from('configuracoes').update({ valor: this.localTaxas.ml_comissao }).eq('chave', 'ml_comissao');
                // Atualizar Frete
                await window.supabase.from('configuracoes').update({ valor: this.localTaxas.ml_frete }).eq('chave', 'ml_frete');

                this.$emit('notificar', { titulo: 'Atualizado!', texto: 'Novas taxas em vigor.' });
                this.$emit('refresh'); // Força o app.js a recarregar as taxas
            } catch (err) {
                console.error(err);
                alert("Erro ao comunicar com o banco.");
            }
        }
    },
    watch: {
        // Se as taxas mudarem no app.js, atualiza o formulário local
        taxas: {
            handler(newVal) { this.localTaxas = { ...newVal }; },
            deep: true
        }
    }
};

export default ConfiguracoesView;
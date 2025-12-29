const ConfiguracoesView = {
    template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-4 md:space-y-8 pt-2 px-4">
        <div class="flex justify-between items-center shrink-0"><h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none">Ajustes</h2></div>
        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center space-y-6 flex-1">
            <div class="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-3xl shadow-sm"><i class="fa-solid fa-dollar-sign"></i></div>
            <div class="text-center"><h3 class="text-lg md:text-2xl font-bold text-slate-800">Taxa Fixa Mercado Livre</h3><p class="text-[10px] md:text-sm text-gray-400 font-medium uppercase tracking-widest mt-2">Valor descontado por unidade</p></div>
            <div class="relative w-full max-w-[220px]">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-yellow-500">R$</span>
                <input v-model.number="taxaLocal" type="number" step="0.01" :disabled="userRole !== 'admin'" :class="userRole !== 'admin' ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''" class="input-soft !text-3xl !font-black !text-center !py-8 !pl-16 border-yellow-200 focus:border-yellow-400">
            </div>
            <button v-if="userRole === 'admin'" @click="salvarTaxa" class="btn-primary w-full max-w-xs py-5 uppercase text-xs font-bold tracking-widest shadow-xl">Salvar Ajuste</button>
            <p v-else class="text-red-400 text-[9px] font-bold uppercase flex items-center gap-2"><i class="fa-solid fa-lock"></i> Somente Administradores podem alterar</p>
        </div>
    </div>`,
    props: ['userRole'],
    data() { return { taxaLocal: 60.00 } },
    methods: {
        salvarTaxa() { if(this.userRole !== 'admin') return; localStorage.setItem('taxaMLFixa', this.taxaLocal); this.$emit('notificar', { titulo: 'Sucesso!', texto: 'Taxa atualizada.' }); }
    },
    mounted() { const s = localStorage.getItem('taxaMLFixa'); if (s) this.taxaLocal = parseFloat(s); }
};

export default ConfiguracoesView;
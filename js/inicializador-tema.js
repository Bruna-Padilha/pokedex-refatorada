(function inicializarTemaGlobal() {
    const configStr = localStorage.getItem('configuracoes');
    if (configStr) {
        const config = JSON.parse(configStr);
        if (config.temaEscuro) {
            document.documentElement.classList.add('tema-escuro');
            return;
        }
    }
    document.documentElement.classList.add('tema-claro');
})();
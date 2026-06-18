function configurarPaginaLogin() {
    const loginForm = document.querySelector('.login-form');
    const loginCard = document.querySelector('.login-card');
    const loginTitle = document.querySelector('.login-card__title');

    if (!loginForm || !loginCard) return;

    if (estaLogado()) {
        loginForm.style.display = 'none';
        if (loginTitle) loginTitle.textContent = "Você já está logado.";

        const logoutContainer = document.createElement('div');
        logoutContainer.innerHTML = `
            <p style="margin-bottom: 20px;"></p>
            <p style="margin-bottom: 30px; color: white;">Deseja deslogar?</p>
            <button id="btn-logout" class="btn btn-start">Deslogar</button>
        `;
        loginCard.appendChild(logoutContainer);

        document.getElementById('btn-logout').addEventListener('click', async () => {
            loginSimulado('false');
            await mostrarPopup('Sessão encerrada.', 'success', {
                titulo: 'Sessão encerrada',
                textoBotao: 'OK'
            });
            window.location.href = 'mainpage.html';
        });
    } else {
        //admin/1234
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const usuarioInput = document.getElementById('usuario').value;
            const senhaInput = document.getElementById('senha').value;

            if (usuarioInput === 'admin' && senhaInput === '1234') {
                loginSimulado('true');
                await mostrarPopup('Login realizado com sucesso!', 'success', {
                    titulo: 'Bem-vindo!',
                    textoBotao: 'Continuar'
                });
                window.location.href = 'index.html';
            } else {
                await mostrarPopup('Usuário ou senha incorretos.', 'error', {
                    titulo: 'Dados inválidos',
                    textoBotao: 'Tentar novamente'
                });
            }
        });
    }
}

inicializar();
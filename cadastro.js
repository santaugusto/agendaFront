document.getElementById('formCadastro').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Coletar dados do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar_senha').value;

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    // Enviar dados para a API
    try {
        const response = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome,
                email,
                senha,
                confirmar_senha: senha
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // Exibir modal de sucesso
            document.getElementById('modalSucesso').classList.remove('hidden');
            setTimeout(() => {
                window.location.href = '/index'; // Redirecionar para página de login
            }, 2000); // Após 2 segundos
        } else {
            // Exibir modal de erro
            document.getElementById('modalErro').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        document.getElementById('modalErro').classList.remove('hidden');
    }
});

// Fechar modais
document.getElementById('closeModalSucesso').addEventListener('click', function() {
    document.getElementById('modalSucesso').classList.add('hidden');
});

document.getElementById('closeModalErro').addEventListener('click', function() {
    document.getElementById('modalErro').classList.add('hidden');
});

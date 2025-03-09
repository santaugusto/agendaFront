  // Escutando o evento de envio do formulário
  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os valores dos campos
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Validação simples dos campos
    if (!email || !senha) {
        alert('E-mail e senha são obrigatórios!');
        return;
    }

    try {
        // Fazendo a requisição POST para a API de login
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
            // Se o login for bem-sucedido, armazena o token no LocalStorage
            localStorage.setItem('token', data.token);

            // Exibe a mensagem de sucesso
            alert('Login bem-sucedido! Redirecionando...');

            // Redireciona após um pequeno delay (2 segundos)
            setTimeout(function() {
                window.location.href = 'agenda.html';
            }, 2000); // 2000ms = 2 segundos
        } else {
            // Exibe a mensagem de erro
            alert(data.message || 'Erro ao tentar fazer login!');
        }
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        alert('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
});
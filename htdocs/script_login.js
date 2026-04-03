// Mostrar / ocultar senha
const toggle = document.getElementById("toggleSenha");
const senhaInput = document.getElementById("senha");

toggle.addEventListener("click", () => {
  const type = senhaInput.type === "password" ? "text" : "password";
  senhaInput.type = type;
  toggle.textContent = type === "password" ? "Mostrar Senha" : "Ocultar Senha";
});

// Envio do formulário via POST para 127.0.0.1:8080
const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const response = await fetch("/login.html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        senha: senha
      })
    });

    // Tenta ler JSON (se o servidor retornar)
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: "Resposta não é JSON" };
    }

    if (response.ok) {
      alert("Login realizado com sucesso!");
      window.location.href = "/index.html";
    } else {
      alert("Erro no login: " + (data.message || "Erro desconhecido"));
    }

  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível conectar ao servidor.");
  }
});
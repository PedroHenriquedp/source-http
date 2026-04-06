const toggle = document.getElementById("toggleSenha");
const senhaInput = document.getElementById("senha");

toggle.addEventListener("click", () => {
  const type = senhaInput.type === "password" ? "text" : "password";
  senhaInput.type = type;
  toggle.textContent = type === "password" ? "Ocultar Senha" : "Mostrar Senha";
});

const form = document.getElementById("cadastroForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const response = await fetch("/cadastro.html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        senha: senha
      })
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: "Resposta não é JSON" };
    }

    if (response.ok) {
      alert("Cadastro realizado com sucesso! Agora você já pode fazer o login.");
      window.location.href = "/login.html";
    } else {
      alert("Erro no cadastro: " + (data.message || "Erro desconhecido"));
    }

  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível conectar ao servidor.");
  }
});

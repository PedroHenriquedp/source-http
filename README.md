# UFABC Study - Servidor HTTP com Sockets em Python

## 📚 UFABC — Universidade Federal do ABC

Este projeto tem como objetivo implementar conceitos básicos de **redes de computadores** utilizando **sockets em Python**, permitindo a comunicação entre cliente e servidor através do protocolo HTTP.

---

## 🎯 Objetivo

Desenvolver uma aplicação simples que simule a comunicação cliente-servidor, abordando:

* Criação de sockets
* Comunicação via TCP/IP
* Tratamento de requisições HTTP
* Envio e recebimento de dados (GET e POST)

---

## 🛠️ Tecnologias utilizadas

* Python 3.11
* Sockets (biblioteca padrão)
* HTML/CSS (interface simples)
* Docker e Docker Compose
* Protocolo HTTP
* JSON (Banco de dados local)

---

## 📁 Estrutura do projeto

```text
.
├── deploy.sh
├── htdocs
│   ├── cadastro.html
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── index.html
│   ├── login.html
│   ├── notas.json
│   ├── __pycache__
│   │   └── sessao.cpython-312.pyc
│   ├── script_cadastro.js
│   ├── script_index.js
│   ├── script_login.js
│   ├── servidorHTTP.py
│   ├── sessao.py
│   ├── sessoes.json
│   ├── style.css
│   └── users.json
└── README.md
```

---

## 🚀 Como executar

### 1. Iniciar o servidor

```bash
cd htdocs
```

```bash
python servidorHTTP.py
```

O servidor será iniciado em:

```
http://127.0.0.1:8080
```


### 2. Acessar o servidor

Acesse o link o arquivo `http://127.0.0.1:8080` no navegador.

---


## 👨‍💻 Autores

### - Luccas Henrique 
### - Pedro Henrique

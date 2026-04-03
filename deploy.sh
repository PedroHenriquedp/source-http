#!/bin/bash

echo "🚀 Iniciando atualização do servidor HTTP..."

cd ~/source-http || exit

echo "⬇️  Puxando as alterações do repositório..."
git pull

cd htdocs || exit

echo "🏗️  Reconstruindo e reiniciando o container..."
docker compose up -d --build

echo "🧹 Limpando lixo e imagens órfãs do Docker..."
docker image prune -f

echo "✅ Deploy finalizado com sucesso! Seu servidor está atualizado."

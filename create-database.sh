#!/bin/bash

# Verifica se os dois argumentos foram passados
if [ $# -ne 2 ]; then
  echo "Uso: $0 <usuario_mysql> <senha_mysql>"
  exit 1
fi

MYSQL_USER=$1
MYSQL_PASSWORD=$2

# Cria o banco de dados
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "
CREATE DATABASE IF NOT EXISTS db_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# Verifica se o comando foi bem-sucedido
if [ $? -eq 0 ]; then
  echo "Banco de dados 'db_user' criado com sucesso!"
else
  echo "Erro ao criar o banco de dados."
fi
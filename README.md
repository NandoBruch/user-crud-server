# Instruções para Rodar o Projeto Nest.js

Este guia descreve os passos essenciais para executar este projeto Nest.js localmente.

## Pré-requisitos

- Nestjs e npm instalados.
- MySQL instalado.
- Redis

## Passos para Rodar

1.  **Instalar Dependências:**

    ```bash
    npm install
    ```

2.  **Configurar Variáveis de Ambiente:**

    - Crie um arquivo `.env` na raiz do projeto. Exemplo disponível no env.sample

3.  **Criar Banco de Dados MySQL (`db_user`):**

    **Opção 1: Via SQL (Recomendado)**

    ```bash
    mysql -u root -p
    ```

    No prompt do MySQL:

    ```sql
    CREATE DATABASE IF NOT EXISTS db_user;
    # (Opcional) Criar usuário e conceder permissões:
    # CREATE USER 'seu_usuario_mysql'@'localhost' IDENTIFIED BY 'sua_senha_mysql';
    # GRANT ALL PRIVILEGES ON db_user.* TO 'seu_usuario_mysql'@'localhost';
    # FLUSH PRIVILEGES;
    # EXIT;
    ```

    **Opção 2: Via Script (Se disponível)**

    ```bash
    chmod +x ./create-database.sh
    ./create_database.sh <usuario> <senha>
    ```

4.  **Rodar o Projeto:**

    ```bash
    npm run dev
    ```

    Acesse a aplicação em `http://localhost:3001` (ou a porta definida no `.env`).

Consulte o `package.json` para mais scripts.

## Solução de Problemas

Verifique as instalações, o arquivo `.env` e as configurações do MySQL em caso de erros.

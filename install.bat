@echo off
echo Instalando dependencias do Python...

:: Verifica se o Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Python nao encontrado! Por favor, instale o Python 3.8 ou superior.
    echo Voce pode baixar em: https://www.python.org/downloads/
    pause
    exit
)

:: Cria ambiente virtual
echo Criando ambiente virtual...
python -m venv venv

:: Ativa ambiente virtual
echo Ativando ambiente virtual...
call venv\Scripts\activate

:: Instala dependencias
echo Instalando dependencias...
pip install -r requirements.txt

:: Cria arquivo .env se não existir
if not exist .env (
    echo Criando arquivo .env...
    echo EMAIL_USER=starkebrasildev@gmail.com > .env
    echo EMAIL_PASSWORD=sua_senha_de_app_aqui >> .env
)

echo.
echo Instalacao concluida!
echo.
echo IMPORTANTE: Edite o arquivo .env e adicione sua senha de app do Gmail
echo.
echo Para iniciar o servidor, execute: python app.py
echo.
pause 
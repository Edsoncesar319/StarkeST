@echo off
echo Iniciando servidor Python...

:: Ativa ambiente virtual
call venv\Scripts\activate

:: Inicia o servidor
python app.py

pause 
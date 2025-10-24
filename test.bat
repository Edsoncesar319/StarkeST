@echo off
echo Testando conexao com o servidor...

:: Testa se o servidor está respondendo
curl -s http://localhost:5000 > nul
if errorlevel 1 (
    echo ERRO: Servidor nao esta respondendo!
    echo Verifique se o servidor Python esta rodando.
    echo Execute start.bat para iniciar o servidor.
) else (
    echo Servidor esta respondendo corretamente!
)

echo.
echo Teste concluido!
pause 
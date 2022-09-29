# Projeto de Processamento Gráfico (UFSCar Sorocaba)
## Projeto Parcial 2 - Professor: Mario Liziér

## Especificações do Projeto
Projeto para a matéria de Processamento Gráfico da UFSCar.

Objetivo: Criar e visualizar uma cena 3D, mapeando os conceitos estudados.

Implementação: JavaScript + WebGL (sem utilizar bibliotecas 3D, exceto pequenas bibliotecas de auxílio)

### Especificações/Avaliação
- [x] Visualização de pelo menos um objeto 3D por membro do grupo, redimensionando e posicionando cada objeto individualmente no ambiente virtual;
- [x] Utilização de pelo menos dois shaders (vertex/fragment);
- [x] Definição de pelo menos uma câmera;
- [x] Movimento simples de pelo menos um objeto;
- [ ] Documentar no github (readme principal) as especificações do projeto, modo de interação e principais características implementadas.

## Como executar
1. Abrir um terminal na pasta raiz do projeto (onde encontra-se o arquivo *server.js*)
2. Executar no terminal os seguintes comandos:
```
> npm install express
> node server.js
```
3. Acessar em algum navegador o [LocalHost:3000](http://localhost:3000) (Preferencialmente pelo Google Chrome)

## Controles de câmera
- Seta Para Cima -> Gira câmera para "cima" (+heightView (+Y))
- Seta Para Baixo -> Gira câmera para "baixo" (-heightView (-Y))
- Seta Esquerda -> Gira câmera para "esquerda" (-angle (X, Z))
- Seta Direita -> Gira câmera para "direita" (+angle (X, Z))

## Controles de Velocidade
- Número 4 -> Diminui a velocidade global
- Número 6 -> Aumenta a velocidade global
- Número 0 -> Pausa a cena (Velocidade global = 0)
- Número 1 -> Redefine para velocidade padrão
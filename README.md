# ProjetoPG
Projeto para a matéria de Processamento Gráfico da UFSCar.

- Objetivo: Criar e visualizar uma cena 3D, mapeando os conceitos estudados.

Implementação: JavaScript + WebGL (sem utilizar bibliotecas 3D, exceto pequenas bibliotecas de auxílio)

Especificações/Avaliação:
- Visualização de pelo menos um objeto 3D por membro do grupo, redimensionando e posicionando cada objeto individualmente no ambiente virtual;
- Utilização de pelo menos dois shaders (vertex/fragment);
- Definição de pelo menos uma câmera;
- Movimento simples de pelo menos um objeto;
- Documentar no github (readme principal) as especificações do projeto, modo de interação e principais características implementadas.

COMO MOVER A CAMERA:
Y Axis:
    W -> Move para "cima" (-Y)
    S -> Move para "baixo" (+Y)
X Axis:
    A -> Move para "esquerda" (-X)
    D -> Move para "direita" (+X)
Z Axis:
    Q -> Move para "longe do obj" (-Z)
    E -> Move para "perto do obj" (+Z)

COMO RODAR A CAMERA:
X Axis (90 Graus):
    9 -> Roda camera por cima (+X 90º)
    7 -> Roda camera por baixo (-X 90º)

X Axis:
    8 -> Roda camera por cima (+X)
    2 -> Roda camera por baixo (-X)
Y Axis:
    4 -> Roda camera pela esquerda (+Y)
    6 -> Roda camera pela direita (-Y)
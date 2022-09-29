# Projeto de Processamento Gráfico (UFSCar Sorocaba)
## Projeto Parcial 2 - Grupo 03 - Professor: Mario Liziér

## Preview
![This is an image](https://i.ibb.co/HHfbS6V/Previa.png)

### Objetos importados para o projeto
Para a visualização da Terra e do Satélite, foram importados os objetos [sphere.obj](public/models/sphere.obj) e [Satellite.obj](public/models/Satellite.obj).

Para o background, [esta imagem](https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/bg.jpg) foi carregada através da [main.css](/public/main.css).

## Especificações do Projeto
Projeto para a matéria de Processamento Gráfico da UFSCar.

Objetivo: Criar e visualizar uma cena 3D, mapeando os conceitos estudados.

Implementação: JavaScript + WebGL (sem utilizar bibliotecas 3D, exceto pequenas bibliotecas de auxílio)

### Especificações/Avaliação
- [x] Visualização de pelo menos um objeto 3D por membro do grupo, redimensionando e posicionando cada objeto individualmente no ambiente virtual;
- [x] Utilização de pelo menos dois shaders (vertex/fragment);
- [x] Definição de pelo menos uma câmera;
- [x] Movimento simples de pelo menos um objeto;
- [x] Documentar no github (readme principal) as especificações do projeto, modo de interação e principais características implementadas.

## Como executar
1. Abrir um terminal na pasta raiz do projeto (onde encontra-se o arquivo *server.js*)
2. Executar no terminal os seguintes comandos:
```
> npm install express
> node server.js
```
3. Acessar em algum navegador o [LocalHost:3000](http://localhost:3000) (Preferencialmente pelo Google Chrome)

## Controles
### Controles de câmera
- Seta Para Cima -> Gira câmera para "cima" (+heightView (+Y))
- Seta Para Baixo -> Gira câmera para "baixo" (-heightView (-Y))
- Seta Esquerda -> Gira câmera para "esquerda" (-angle (X, Z))
- Seta Direita -> Gira câmera para "direita" (+angle (X, Z))

### Controles de Velocidade
- Número 4 -> Diminui a velocidade global
- Número 6 -> Aumenta a velocidade global
- Número 0 -> Pausa a cena (Velocidade global = 0)
- Número 1 -> Redefine para velocidade padrão

## Movimento
O movimento é definido e calculado na [main.js](public/js/main.js).

Sendo `globalSpeed` uma variável controlada pelo usuário, a partir dela é calculada a velocidade de rotação da Terra. (Alguns valores diferem da realidade para melhor visualização.)
```
// Calcular velocidade de rotação
var baseSpeed =  globalSpeed * Math.PI/180 // 365 dias
var earthRotationSpeed = baseSpeed * 365 // 1 dia
var revolutionspeed = earthRotationSpeed/300 // Valor para melhor visualização. Valor Real: 27 // 27 dias

// Rotação da Terra
mat4.rotateY(earthNode.localMatrix, earthNode.localMatrix, revolutionspeed); 
mat4.rotateY(earthNode.privateMatrix, earthNode.privateMatrix, earthRotationSpeed); 
```
O satélite é "preso" na Terra e, assim, gira em volta dela.

## Iluminação
Na [main.js](public/js/main.js), a variável `lightPosition` define as coordenadas [10, 0, 10] para a fonte de luz. Também há variáveis que são utilizadas para calcular a luz ambiente (`ambientLight`), o brilho da luz especular (`shininess`) e sua intensidade (`specularIntensity`).

Através do [Vertex Shader](public/shader/vertexShader.glsl) e do [Fragment Shader](public/shader/fragmentShader.glsl), a luz é calculada e definida nos objetos da cena.

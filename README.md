# Agile War

Jogo de tabuleiro estilo *War* (Risk) sobre métodos ágeis, feito para revisão da disciplina de Gerência de Projetos de Software.

## Tema

O mapa tem 7 continentes, um para cada método ágil, e cada território leva o nome de uma característica daquele método:

- **Extreme Programming (XP)** — pair programming, TDD, integração contínua, refatoração
- **Scrum** — product backlog, sprint backlog, daily, scrum master
- **Lean Software Development** — eliminar desperdício, entregar rápido, empoderar o time, ver o todo
- **Kanban** — quadro kanban, limite de WIP, fluxo contínuo, kaizen
- **Feature Driven Development (FDD)** — modelo de domínio, arquiteto-chefe, programador-chefe, lista de features
- **LeSS** — product owner único, backlog único, equipes multifuncionais, simplicidade
- **SAFe** — nível time, nível programa, large solution, portfólio

Cada continente tem exatamente 4 territórios (28 no total).

## Regras

1. **Sorteio inicial**: territórios são distribuídos aleatoriamente entre os jogadores; cada um recebe um lote de exércitos para posicionar nos seus territórios e um **continente-objetivo** sorteado (distinto entre os jogadores) antes da primeira rodada.
2. **Reforço**: no início do turno, o jogador recebe exércitos (mínimo 3, ou 1 a cada 3 territórios) mais bônus por continente inteiro controlado, e os distribui livremente entre seus territórios.
3. **Ataque**: o jogador escolhe um território seu (com 2+ exércitos) e um território inimigo adjacente. Para conquistá-lo, precisa responder corretamente uma questão de múltipla escolha da Revisão 3 (apenas as 21 questões objetivas). Resposta certa = conquista o território; resposta errada = perde 1 exército no território atacante.
4. **Fortificação**: ao final do turno, o jogador pode mover exércitos entre dois territórios seus adjacentes.
5. **Vitória**: vence quem primeiro cumprir uma destas condições:
   - **Objetivo** (condição principal): controlar os 4 territórios do seu continente-objetivo sorteado;
   - **Dominação**: controlar todo o mapa;
   - **Eliminação**: ser o último jogador restante.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço local mostrado no terminal (geralmente `http://localhost:5173`).

Para gerar uma build de produção:

```bash
npm run build
npm run preview
```


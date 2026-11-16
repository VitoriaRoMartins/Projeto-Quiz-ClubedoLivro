# 🏆 Quiz Gamificado — Clube do Livro do Mês

Aplicação web responsiva (Mobile-First) com **React + TypeScript + Tailwind CSS + Framer Motion** e suporte a **Placar Ao Vivo (Realtime)**, totalmente personalizável a cada mês através de um único arquivo JSON (`src/config/quiz-config.json`).

---

## ✨ Funcionalidades Implementadas

1. **Etapa 1 — Login Simples & Boas-Vindas (`Step1Login.tsx`)**
   - Exibe a capa oficial, subtítulo, autor e tema de cores do livro do mês.
   - Campo rápido de Nome/Apelido, código da sala ao vivo (`CLUBE2026` por padrão) e opção de ativar/desativar competidores IA do clube.
   - Botões rápidos para alternar entre os livros do clube (**Os Jogos dos Deuses**, **Enigma**, **Wild Love** e **Duna**) ou importar qualquer arquivo `.json` diretamente pela tela.

2. **Etapa 2 — Criador de Personagem / Avatar (`Step2Avatar.tsx` & `AvatarSystem.tsx`)**
   - Customização interativa em tempo real: Tom de pele, Estilo de cabelo, Cor do cabelo, Expressão/Humor, Acessório literário (óculos, coroa do Olimpo, chapéu místico, fones Rose Hill), Insígnia do leitor e Cor da aura.
   - Botão **"Sortear Visual"** e botão **"Entrar na Batalha!"**.

3. **Etapa 3 — O Quiz de 10 Perguntas (`Step3Question.tsx`)**
   - 10 perguntas de múltipla escolha (4 alternativas `A`, `B`, `C`, `D` com área de toque > 56px no celular).
   - Cronômetro regressivo visível com alerta visual e sonoro nos últimos 5 segundos.
   - Feedback imediato ao responder: **Verde** para acerto e **Vermelho** para erro.

4. **Etapa 4 — Leaderboard / Placar Parcial a cada Pergunta (`Step4Leaderboard.tsx`)**
   - Transição animada com Framer Motion estilo Kahoot após cada uma das 10 perguntas.
   - Exibe avatar, posição atual, variação de posição (`+1 pos`, `-2 pos`), pontos ganhos na rodada e tempo acumulado.

5. **Etapa 5 — Pódio Final Animado & Compartilhamento (`Step5Podium.tsx`)**
   - Chuva de confetes (`canvas-confetti`) + fanfarra sonora + destaque especial para 1º, 2º e 3º lugares.
   - Resumo individual com Posição Final, Total de Acertos, Tempo Médio por resposta e botão para compartilhar o resultado no WhatsApp/Instagram.

6. **Fórmula Oficial de Pontuação + Critério de Desempate (`realtimeStore.ts`)**
   - $Pontos = 1000 \times \left(1 - \frac{TempoDecorrido}{2 \times TempoTotal}\right)$
   - Desempate automático por menor tempo acumulado nas respostas corretas.

---

## 🚀 Como Rodar no Computador

No terminal (PowerShell ou CMD), entre na pasta `quiz-clube-do-livro` e execute:

```bash
cd "quiz-clube-do-livro"
npm.cmd run dev
```

Depois, abra o link exibido (geralmente `http://localhost:5173`) no navegador!

---

## 📅 Como Trocar o Livro do Mês

Basta editar o arquivo [`src/config/quiz-config.json`](./src/config/quiz-config.json) (ou clicar em **"Importar .json"** direto na tela inicial do aplicativo) mantendo a estrutura de cores, regras e as 10 perguntas!

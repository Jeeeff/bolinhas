# 🫧 Bolinhas Voadoras

Simulador interativo de física de partículas em tempo real — Next.js 16 + TypeScript + Canvas 2D.

Arquitetura **plugin-based**: cada força física é um módulo isolado com schema declarativo, e a UI de controle é gerada automaticamente a partir desse schema. Adicionar uma nova força = criar 1 arquivo e registrar.

## 🎮 Demo ao vivo

- **Site**: _(deploy Vercel — URL a adicionar após deploy)_
- **Portfólio**: [jeffersonbernardo.dev](https://github.com/Jeeeff/portifolio-JB)

## ✨ Features

- **8 forças físicas plugáveis**: gravidade, vento, arrasto, mouse atrator, vórtice, turbulência (flow field), atração orbital, onda de choque (click)
- **UI schema-driven**: sliders e toggles auto-gerados por força
- **Até 3000 partículas** com renderer Canvas 2D otimizado (batching por buckets de cor)
- **Interações**: arrasta o mouse (atração/vórtice), clica (shockwave radial com anel visível)
- **Visual tunável**: rastros, glow aditivo, cor por velocidade, tema dark

## 🧱 Arquitetura

```
┌─────────────────────────────────────────────┐
│  UI (React)   Simulator / Canvas / Controls │
├─────────────────────────────────────────────┤
│  Hook         useSimulation (RAF + state)   │
├─────────────────────────────────────────────┤
│  Renderer     Canvas2DRenderer  (pluggable) │
├─────────────────────────────────────────────┤
│  Engine       World + loop orchestrator     │
│                                             │
│  Integrator   Euler (+ Verlet planejado)    │
│  Forces[]     gravity, wind, vortex, …      │
│  Constraints[] bounds                       │
├─────────────────────────────────────────────┤
│  Types        Particle, Force, Constraint   │
└─────────────────────────────────────────────┘
```

Detalhes em [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) · catálogo de forças em [`docs/FORCES.md`](./docs/FORCES.md) · roadmap em [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## 🚀 Rodar localmente

```bash
npm install
npm run dev
# abrir http://localhost:3000
```

## 🛠️ Stack

Next.js 16 · React 19 · TypeScript (strict) · TailwindCSS · Canvas 2D · Turbopack

## ➕ Adicionar uma força

1. Criar `src/lib/physics/forces/<nome>.ts` implementando a interface `Force<C>`
2. Exportar e registrar em `src/lib/physics/forces/index.ts`
3. UI se gera sozinha a partir do `schema` declarado

Exemplo mínimo em `AGENTS.md`.

## 📄 Licença

MIT — uso livre.

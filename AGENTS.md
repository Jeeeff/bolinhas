# AGENTS.md — Bolinhas Voadoras

Simulador interativo de física de partículas 2D. Começa com gravidade + vento, projetado para escalar a dezenas de forças, constraints, emissores e renderizadores sem tocar no núcleo.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript strict (sem `any`, sem implicit any)
- TailwindCSS (dark mode via classe `dark`)
- Canvas 2D para rendering (Fase 1); WebGL/WebGPU planejado

## Comandos

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm run lint
```

## Arquitetura — regra de ouro

**Tudo plugável. Nada hardcoded no loop.**

O `World` orquestra. Forças, constraints, integradores e renderers são plugins que implementam interfaces em `src/types/`. O loop central nunca muda; só o registro de plugins.

Loop canônico:
```
forEach particle:
  resetForces(p)
  forEach enabled force:      force.apply(p, world, dt)
  integrator.step(p, dt)
  forEach enabled constraint: constraint.resolve(p, world)
renderer.render(world)
```

## Como adicionar uma nova força

1. Criar `src/lib/physics/forces/<nome>.ts` exportando um objeto `Force<Config>`.
2. Declarar `schema` com os controles (kind: slider/toggle) — a UI se auto-gera.
3. Registrar em `src/lib/physics/forces/index.ts`.
4. Atualizar `docs/FORCES.md` com uma linha.

**Nada mais.** Não edite `World`, `useSimulation`, nem `ControlPanel`.

Exemplo mínimo:
```ts
// src/lib/physics/forces/drag.ts
import type { Force } from "@/types/force";

interface DragConfig { coefficient: number }

export const drag: Force<DragConfig> = {
  id: "drag",
  label: "Arrasto",
  enabled: false,
  config: { coefficient: 0.02 },
  schema: {
    coefficient: { kind: "slider", label: "Coef.", min: 0, max: 0.5, step: 0.001 },
  },
  apply(p) {
    p.acceleration.x -= p.velocity.x * this.config.coefficient;
    p.acceleration.y -= p.velocity.y * this.config.coefficient;
  },
};
```

## Como adicionar um constraint

Mesmo padrão: `src/lib/physics/constraints/<nome>.ts` + registrar no `index.ts`.

## Convenções

- Imports absolutos via `@/` (configurado em `tsconfig.json`).
- `"use client"` só em componentes que usam hooks, DOM ou browser APIs.
- Engine é **pure TS** — nunca importa React.
- Renderer é **DOM-aware** — só ele toca `canvas.getContext`.
- Config de plugin é sempre serializável (números, booleans, strings) — prepara `save/load preset`.
- Nomes em PT-BR para labels de UI, EN para IDs e código.

## Nunca

- Acoplar rendering ao engine.
- Usar `any` ou `as unknown as X`.
- Mutar config de um plugin direto; passa pelo `useSimulation.setForceConfig(id, partial)`.
- Criar uma "força especial" no `World` em vez de plugin.
- Commitar `node_modules`, `.next`, `.env.local`.

## Verificação manual (Fase 1)

1. `npm run dev` → 100 partículas caem e oscilam com vento.
2. Toggles de gravidade/vento funcionam.
3. Reset respawna.
4. FPS ≥ 55.
5. `npm run build` sem erros.

## Documentação

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — contratos detalhados
- [docs/ROADMAP.md](docs/ROADMAP.md) — fases 1–5
- [docs/FORCES.md](docs/FORCES.md) — catálogo de forças

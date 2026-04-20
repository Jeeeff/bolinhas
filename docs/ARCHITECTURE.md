# Arquitetura

## Camadas

```
┌─────────────────────────────────────────────┐
│  UI (React)    Simulator / Canvas / Panel   │
├─────────────────────────────────────────────┤
│  Hook          useSimulation (RAF + state)  │
├─────────────────────────────────────────────┤
│  Renderer      Canvas2DRenderer (pluggable) │
├─────────────────────────────────────────────┤
│  World         orquestrador + tick(dt)      │
│   ├─ Integrator (Euler)                     │
│   ├─ Force[]    (plugins)                   │
│   ├─ Constraint[] (plugins)                 │
│   └─ Emitter[]  (plugins, Fase 2+)          │
├─────────────────────────────────────────────┤
│  Types         interfaces puras             │
└─────────────────────────────────────────────┘
```

Regra: **uma camada só conhece a de baixo**. UI fala com hook; hook fala com World; World fala com plugins e types; nada mais.

## Contratos

### `Particle`
Dados puros. Sem métodos.
```ts
interface Particle {
  id: number;
  position: Vector2;
  previousPosition: Vector2;   // para Verlet no futuro
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  radius: number;
}
```

### `Force<C>`
```ts
interface Force<C = unknown> {
  id: string;                              // único
  label: string;                           // PT-BR, aparece na UI
  enabled: boolean;
  config: C;
  schema: ConfigSchema<C>;                 // controles da UI
  apply(p: Particle, world: World, dt: number): void;
  reset?(): void;                          // opcional
}
```

`ConfigSchema<C>` = `{ [K in keyof C]: ControlDescriptor }`, onde `ControlDescriptor` é slider (min/max/step) ou toggle. Isso é o que permite **UI auto-gerada**.

### `Constraint`
Roda depois da integração, corrige posição/velocidade.
```ts
interface Constraint {
  id: string;
  label: string;
  enabled: boolean;
  resolve(p: Particle, world: World): void;
}
```

Ex: `bounds` (colisão com paredes), `collision` (futuro, partícula-partícula via spatial hash).

### `Integrator`
Estratégia de integração numérica.
```ts
interface Integrator {
  id: "euler" | "verlet" | "rk4";
  step(p: Particle, dt: number): void;
}
```

### `Renderer`
Desacoplado do engine. Recebe `World`, desenha.
```ts
interface Renderer {
  init(canvas: HTMLCanvasElement): void;
  render(world: World): void;
  dispose(): void;
}
```

## Decisões

**Por que Euler primeiro?** Simples, suficiente para forças leves. Verlet entra quando adicionarmos colisões partícula-partícula (Fase 3), pois é mais estável e energia-conservante.

**Por que schema-driven UI?** Adicionar uma força sem tocar em React. Um `Force` carrega seus próprios controles; o painel só reflete. Escala linearmente.

**Por que `World` como classe mutável e não estado imutável?** Performance: 100–10k partículas por frame. Imutabilidade via spread seria O(n) a cada tick. A imutabilidade mora na **fronteira React** (snapshot do array no hook).

**Por que renderer separado?** Permite trocar Canvas 2D → WebGL sem tocar no engine. Plano: Fase 5 adiciona `WebGLRenderer` implementando a mesma interface.

## Como trocar integrador

No `World`, atribuir `world.integrator = verlet`. Nenhuma força precisa mudar.

## Como adicionar renderer novo

1. Implementar `Renderer` em `src/lib/render/<nome>.ts`.
2. Em `Simulator.tsx`, instanciar o novo renderer no lugar de `Canvas2DRenderer`.

## Performance — diretrizes

- Não alocar objetos por partícula por frame (reusar vectors).
- Spatial hash só entra na Fase 3 (colisão); sem ele, O(n²) é proibido.
- `requestAnimationFrame` único, clamp de `dt ≤ 0.05s` para evitar explosões numéricas em tab inativa.

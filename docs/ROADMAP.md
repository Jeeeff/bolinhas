# Roadmap

## Fase 1 — MVP (atual)
- [x] Scaffold Next + TS + Tailwind
- [ ] Arquitetura plugin-based (World, Force, Constraint, Integrator, Renderer)
- [ ] Forças: `gravity`, `wind`
- [ ] Constraint: `bounds`
- [ ] Integrator: `euler`
- [ ] Renderer: `Canvas2DRenderer` (círculos)
- [ ] Painel schema-driven
- [ ] 100 partículas a ≥ 55 FPS

## Fase 2 — Mais interações
- [ ] Força `drag` (arrasto viscoso)
- [ ] Força `vortex` (vórtice em ponto configurável)
- [ ] Força `attractor` (mouse como atrator/repulsor)
- [ ] Input de mouse (pointer events)
- [ ] Emissor pontual (`PointEmitter`) — spawn contínuo
- [ ] Controle pause/step (um frame)
- [ ] Contador de partículas com cap configurável

## Fase 3 — Simulação rica
- [ ] Colisão partícula-partícula via spatial hash (grid uniforme)
- [ ] Integrador Verlet
- [ ] Trails (fade out no render)
- [ ] Salvar/carregar presets (JSON localStorage)
- [ ] Partículas com lifetime e cores

## Fase 4 — Estruturas
- [ ] Molas (`spring` como constraint entre 2 partículas)
- [ ] Corpos rígidos leves (cadeia de partículas + molas)
- [ ] Soft-body básico (grid de molas)
- [ ] Múltiplos emissores com shapes diferentes

## Fase 5 — Performance (stretch)
- [ ] Renderer WebGL (instanced quads)
- [ ] Spatial hash otimizado (Morton / z-order)
- [ ] GPU compute (WebGPU) para N-body
- [ ] 100k+ partículas

# Catálogo de Forças

Uma linha por força implementada. Atualizar sempre que registrar uma nova.

| ID | Label | Arquivo | Parâmetros | Descrição |
|---|---|---|---|---|
| `gravity` | Gravidade | [gravity.ts](../src/lib/physics/forces/gravity.ts) | `strength`, `inverted` | Aceleração vertical constante |
| `wind` | Vento | [wind.ts](../src/lib/physics/forces/wind.ts) | `strength`, `frequency` | `a.x += sin(t·f) · s` |
| `drag` | Arrasto | [drag.ts](../src/lib/physics/forces/drag.ts) | `coefficient` | `a -= v · k` |
| `mouseAttractor` | Mouse | [mouseAttractor.ts](../src/lib/physics/forces/mouseAttractor.ts) | `strength`, `radius`, `repel` | Atrai/repele radialmente pelo ponteiro |
| `vortex` | Vórtice | [vortex.ts](../src/lib/physics/forces/vortex.ts) | `strength`, `radius`, `clockwise` | Swirl tangencial ao redor do ponteiro |
| `turbulence` | Turbulência | [turbulence.ts](../src/lib/physics/forces/turbulence.ts) | `strength`, `scale`, `speed` | Flow field pseudo-noise global (sin/cos) |
| `orbitalPull` | Órbita | [orbitalPull.ts](../src/lib/physics/forces/orbitalPull.ts) | `strength`, `spin` | Atração ao centro + componente tangencial |
| `shockwave` | Onda | [shockwave.ts](../src/lib/physics/forces/shockwave.ts) | `thickness` | Empurra anel expansivo após clique |
| `tilt` | Giroscópio | [tilt.ts](../src/lib/physics/forces/tilt.ts) | `strength` | Aceleração proporcional à inclinação do dispositivo |

## Constraints

| ID | Label | Arquivo | Descrição |
|---|---|---|---|
| `bounds` | Paredes | [bounds.ts](../src/lib/physics/constraints/bounds.ts) | Reflete na borda com restituição |

## Integradores

| ID | Arquivo | Ordem |
|---|---|---|
| `euler` | [euler.ts](../src/lib/physics/integrators/euler.ts) | 1ª ordem, simples |

## Interações

- **Arraste do mouse** → afeta `mouseAttractor` e `vortex` (se ligados)
- **Clique** → emite `shockwave` (anel visível + impulso radial)
- **Turbulência + Órbita** → ligar ambas cria movimento galático

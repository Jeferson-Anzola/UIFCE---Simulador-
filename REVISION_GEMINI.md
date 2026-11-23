# Contraste de la revisión de Gemini con la teoría y el código

Gemini revisó los 38 simuladores a partir de clips de pocos segundos (solo la gráfica y dos deslizadores).
Cada hallazgo se contrastó con el código del simulador y con la bibliografía del proyecto (Mankiw, Krugman y
Wells, Varian, Monsalve, Blanchard 7.ª ed., Krugman y Obstfeld, Romer). Criterio: se acepta lo que la teoría
respalda y el código confirma; se rechaza lo que contradice la teoría o lo que el simulador ya hace.

**Patrón general.** Casi la mitad de los «faltantes» que señala Gemini ya existen: están en el panel de
resultados, que no aparecía en los clips (excedentes y PPM, costo de oportunidad, índice de Lerner,
beneficios de Cournot/Stackelberg/cártel, TMS frente a p₁/p₂, rendimientos a escala, impuesto pigouviano,
teorema de Coase, recta de precios en la caja de Edgeworth, consumo y regla de oro en Solow). Varios errores
«graves» son lecturas equivocadas del video («Hash» por «Nash», «A = 0» por «R = 0», parámetros distintos a
los reales). Los ejes que se reescalan sí son reales en varios simuladores, pero es un asunto visual, no
teórico.

Leyenda: ✅ se acepta y se implementa · ⚠️ correcto en teoría, pero no se cambia (motivo) · ❌ se rechaza.

## Fundamentos (Mankiw; Krugman y Wells)

| Hallazgo de Gemini | Veredicto | Por qué |
|---|---|---|
| Llamar «pendiente» a b y d: en el plano (Q, P) la pendiente es −1/b y +1/d | ✅ | Correcto: b = −ΔQᵈ/ΔP es la respuesta de la cantidad, no la inclinación de la recta dibujada. Se renombra «respuesta de Qᵈ al precio». |
| Precios o cantidades negativos con a < c o P > a/b | ❌ | El motor ya los impide: con a < c avisa que a precio cero se ofrece más de lo que se demanda; las cantidades se truncan en cero y P₁ se limita a a/b. |
| No hay valores numéricos de EC, EP, PPM, recaudo | ❌ | Están en el panel de resultados de cada simulador. |
| Elasticidades: rótulos «ε > 1» sin valor absoluto | ✅ | Mankiw reporta \|ε\|; se escribe \|ε\| para que no choque con el signo negativo de la fórmula. |
| Elasticidades: descomponer ΔIT en efecto precio y efecto cantidad | ✅ | Mankiw cap. 5 (cómo cambia el ingreso total) y Krugman y Wells cap. 6: se dibujan las dos áreas. |
| Elasticidades: confusión entre elasticidad puntual y de punto medio | ⚠️ | Ya se reportan las dos por separado y con nombre; se deja como está. |
| Impuestos: mostrar qué parte del recaudo paga cada lado | ✅ | Mankiw cap. 6 (incidencia): el rectángulo de recaudo se parte en la carga del comprador y la del vendedor. |
| Impuestos: con subsidio (t < 0) no se ve el gasto fiscal | ✅ | El gasto s·Qₛ no se dibujaba. Se añade su rectángulo (contorno) y la PPM a la derecha de Q*. |
| Impuestos: el marcador de Laffer sale del lienzo con t < 0 | ❌ | Con t < 0 el marcador no se dibuja; la curva de Laffer solo tiene sentido para t ≥ 0. |
| Controles de precios: no se ve la magnitud de la escasez o el excedente | ✅ | Mankiw figs. 6-2 y 6-4: se marca el tramo Qᵈ − Qˢ sobre el precio controlado. |
| Externalidades: no se ve la altura del costo externo e | ✅ | Se marca la distancia vertical e entre costo privado y social en Q*. |
| Externalidades: truncar Q* ≥ 0 si e es muy alto | ❌ | Ya ocurre: el motor devuelve Q* = 0 (sin intercambio). |
| Comercio: con Pw = 12 la ganancia neta es +36 | ❌ | Error aritmético de Gemini: ΔEC = +420, ΔEP = −330, ganancia neta = ½·6·(76 − 46) = 90, que es lo que calcula el simulador. |
| Comercio: al exportar, «los consumidores pierden más de lo que ganan los productores» | ❌ | Es al revés (Mankiw cap. 9): la ganancia de los productores supera la pérdida de los consumidores. |
| FPP y ventaja comparativa: falta el costo de oportunidad en vivo | ❌ | Ya está en la tabla de resultados. |
| Ejes que se reescalan al mover a, b, c, d | ⚠️ | Es real, pero es visual y no cambia la economía. Redondear los rangos rompe la prueba de paridad con el Bloque A en Python (compara las curvas punto a punto); se deja para una revisión de interfaz. |
| Botón de estado base E₀ | ❌ | Oferta y demanda ya deja E₀ y las curvas iniciales punteadas al aplicar un determinante. |

## Microeconomía 1 (Varian, Nicholson, Monsalve)

Gemini confirma que las fórmulas y los valores numéricos son correctos en los ocho simuladores.

| Hallazgo | Veredicto | Por qué |
|---|---|---|
| Preferencias: el valor U(x₀, y₀) aparece en la curva equivocada | ❌ (con mejora ✅) | La leyenda muestra U de las curvas de referencia, que pasan por (2, 2) y (8, 8); no hay error. Sí se añade el valor U(x₀, y₀) al nombre de la curva dorada. |
| Elección óptima: faltan TMS frente a p₁/p₂ y el aviso de esquina | ❌ | Ya están: tabla con TMS y p₁/p₂, tipo de solución (interior, esquina, vértice, indeterminada) y segmento resaltado con sustitutos perfectos. |
| Competencia perfecta: resaltar el punto de cierre | ✅ | Varian cap. 22 y Monsalve: se marca en la gráfica de la empresa el mínimo del CVMe (cierre) y del CMe (nivelación). |
| Producción: indicador de rendimientos a escala | ❌ | Ya está en la tabla (tipo y grado de homogeneidad). |
| Blindar precios, ingreso y parámetros en cero | ❌ | Los deslizadores ya empiezan en valores positivos (p ≥ 0.5, α, β ≥ 0.1). |
| Aislar variables en Demanda y Slutsky | ❌ | Se refiere a cómo se grabó el clip, no al simulador. |
| Panel izquierdo con scroll | ⚠️ | Asunto de diseño de interfaz, no de teoría; fuera de esta revisión. |

## Microeconomía 2 (Varian, Monsalve, Mas-Colell)

Gemini confirma la exactitud numérica de los siete simuladores.

| Hallazgo | Veredicto | Por qué |
|---|---|---|
| Bienestar: no demuestra los teoremas del bienestar | ❌ | El simulador es «Bienestar y elección social»; los teoremas están en Equilibrio con producción (enfoque «teoremas») y en la caja de Edgeworth. |
| Equilibrio con producción: E = 54.08 frente al valor analítico 54.29 | ❌ | Verificado: el simulador da L₁ = 70, K₁ = 30 e y₁ = y₂ = 54.29 (malla + sección áurea), igual que la solución cerrada. |
| Edgeworth: falta la recta presupuestaria y p₁/p₂ | ❌ | La recta de precios por ω ya se dibuja con p₁/p₂ en el rótulo y en la tabla. |
| Externalidades: falta Coase y el valor de t* | ❌ | Ambos están en el panel (t* = CMgE(Q*), daño evitado y beneficio perdido). |
| Incertidumbre: marcar u(E[w]) para ver la desigualdad de Jensen | ✅ | Varian cap. 12: se dibuja el punto (VE, u(VE)) sobre la curva y la brecha con UE. |
| Incertidumbre: normalizar u(w) = 100·(w/100)^r | ⚠️ | Es válido (la utilidad VNM admite transformaciones afines y EC y la prima no cambian), pero cambiaría los valores de UE de los ejercicios del modal. Se mantiene u(w) = w^r. |
| Empresa competitiva: proyecciones de (x*, y*) a los ejes | ✅ | Se añaden las guías punteadas. Los valores x*, y*, π* y Hotelling ya estaban en el panel. |
| Empresa competitiva: α = 0.8 «dispara» x* | ❌ | Es el resultado correcto: x* = (αp/w)^{1/(1−α)} crece muy rápido cuando α → 1. |
| Slutsky: ver Slutsky y Hicks a la vez | ✅ | Varian cap. 8: con la compensación de Slutsky se marca también la cesta de Hicks para ver la sobrecompensación. |
| Notación ω₁ en lugar de Ω₁ | ❌ | Varian y Monsalve usan ω para las dotaciones. |

## Microeconomía 3 (Varian, Tirole, Gibbons, Monsalve)

| Hallazgo | Veredicto | Por qué |
|---|---|---|
| Juegos: «Hash puro» | ❌ | El código dice «Nash puro»; fue una mala lectura del video. |
| Juegos: la leyenda nombra el perfil equivocado | ❌ | Rótulo, leyenda y tabla usan los mismos índices (i, j); con dos equilibrios la leyenda muestra ambos. |
| Juegos: continuo de equilibrios con dominancia débil | ✅ | Gibbons cap. 1: cuando las mejores respuestas coinciden en un segmento, todo el segmento son equilibrios de Nash. Se resalta. |
| Juegos: falta la matriz de pagos | ❌ | Está en el panel de resultados. |
| Limones: la línea «información completa» está mal rotulada | ✅ | Con información simétrica no hay un precio único; esa línea es la disposición a pagar si se ofrecen todas las calidades (k·θ̄). Se renombra. |
| Limones: la DAP no existe para p < θ_min | ✅ | Varian cap. 37: con p < θ_min nadie ofrece; la curva empieza en θ_min. |
| Limones: sombrear calidades vendidas y expulsadas | ✅ | Se sombrea [θ_min, p*] (se venden) y (p*, θ_max] (salen del mercado). |
| Limones: no permite θ_min = 0 (colapso total) | ❌ | El deslizador ya va desde 0. |
| Monopolio: falta Lerner, EC y beneficio | ❌ | Están en el panel y el beneficio tiene su rectángulo. |
| Oligopolio: faltan beneficios y el cártel | ❌ | La tabla compara Cournot, Stackelberg, colusión y Bertrand con π₁ y π₂. |
| Oligopolio: c₁ = c₂ = 15 por defecto | ❌ | Costos cero es el caso de manual (Varian); es una elección de calibración. |
| Oligopolio: las curvas de reacción no se mueven al cambiar b | ❌ | Es una propiedad real del modelo lineal: cambiar b reescala todas las cantidades en 1/b, así que la figura es idéntica a otra escala. |

## Macroeconomía 1 (Blanchard, 7.ª ed.)

| Hallazgo | Veredicto | Por qué |
|---|---|---|
| Mundell–Fleming: la IS final omite φ·Δe y el equilibrio queda fuera de ella | ❌ | La IS final se dibuja con el tipo de cambio final, y el equilibrio es su intersección exacta. |
| Mundell–Fleming: con i ≠ i* se viola la paridad | ❌ | En Blanchard (cap. 20), con eᵉ dado la tasa interna puede diferir de i* y el tipo de cambio se ajusta por la paridad; es la convención del libro. |
| DA–OA: en la trampa deflacionaria se borra la gráfica | ✅ | Real. Blanchard cap. 9: se mantiene la DA y la OA de largo plazo para que se vea que la DA no alcanza Ȳₙ, con el aviso. |
| DA–OA: eje P fijo en [0, 6] | ❌ | El eje se calcula con los precios de equilibrio. |
| IS–LM: b₁ y b₂ invertidos | ❌ | Encabezado, modelo y panel usan I = b₀ + b₁Y − b₂i e IS: Y = (A − b₂i)/(1 − c₁ − b₁). |
| IS–LM: arrancar con M fija para ver el crowding out | ❌ | Blanchard 7.ª ed. usa la LM horizontal (i fijada por el banco central); el modo con M fija ya existe. |
| Choques precargados al abrir | ❌ | Es intencional: muestra E₀ → E₁ al abrir. Mover un parámetro estructural mueve base y choque juntos porque el choque se define respecto a la base. |
| Cruz keynesiana: falta definir A | ✅ | Se escribe A = c₀ − c₁T₀ + Ī + G en el encabezado. |
| Tabla de convenciones entre manuales | ⚠️ | Útil, pero el proyecto cita solo Blanchard 7.ª ed. en Macro 1. |

## Macroeconomía 2 (Krugman y Obstfeld; Blanchard; Romer)

| Hallazgo | Veredicto | Por qué |
|---|---|---|
| Mundell–Fleming en cinco paneles no es IS–LM–BP | ⚠️ | Es un modelo de fondos prestables de economía abierta a pleno empleo (diseño deliberado); el IS–LM–BP está en Macro 1 y el corto plazo en DD–AA. |
| Mundell–Fleming: signo de la paridad invertido | ❌ | El código usa i* + 100·(Eᵉ − E)/E, la forma correcta con E en moneda nacional por divisa (Krugman y Obstfeld cap. 14). |
| Mundell–Fleming: el punto queda sobre la FPP con déficit | ❌ | Ya se distingue producción (Sᴺ, C) sobre la FPP de la absorción (I, C) fuera de ella. |
| DA–OA: el panel de Phillips grafica la variación acumulada de P y no la inflación | ✅ | Real. Blanchard cap. 8–9 y Mankiw cap. 14: un choque único de demanda no deja inflación permanente. Se grafica la inflación de cada período, y el mediano plazo queda en π = 0, u = u*. |
| DA–OA: desempleo negativo con d = 4 | ❌ | Ya se trunca en u = 0 con aviso. |
| DD–AA: rótulo «A = 0 (trampa de liquidez)» | ❌ | El rótulo es «R = 0: trampa de liquidez» y marca el tramo plano de la AA, como en Krugman y Obstfeld. |
| DD–AA: faltan choques permanentes | ❌ | Ya existen (E₂ = largo plazo o choque permanente). |
| Solow: k_oro mal calculado con α = 0.6 | ❌ | La fórmula es exacta: k_oro = (αA/(n+g+δ))^{1/(1−α)}. Gemini supuso n+g+δ = 0.20 cuando el valor por defecto es 0.15. |
| Solow: el rótulo dice s·f(k) y omite A | ✅ | Se unifica la notación a s·A·f(k). |
| Solow: falta el consumo c* y la alerta de ineficiencia dinámica | ❌ | Ambos ya están. |
| IS–LM: la cruz keynesiana no coincide con el IS–LM | ❌ | La cruz se dibuja con la tasa de equilibrio final y su Y coincide con el IS–LM. |
| Phillips: el eje X salta de 15 a 30 | ✅ (visual) | Se usan dos escalas fijas para que la pendiente β no parezca cambiar. |

## Cambios que se implementan

- **Fundamentos:** nombres de b y d; \|ε\| y efecto precio/cantidad en Elasticidades; incidencia y subsidio en Impuestos; brecha de escasez/excedente en Controles; costo externo e en Externalidades.
- **Micro 1:** U(x₀, y₀) en la curva dorada; puntos de cierre y nivelación en Competencia perfecta.
- **Micro 2:** punto de Jensen en Incertidumbre; guías de (x*, y*) en Empresa competitiva; cesta de Hicks junto a la de Slutsky.
- **Micro 3:** limones (DAP desde θ_min, línea renombrada, calidades vendidas y expulsadas); continuo de equilibrios de Nash.
- **Macro 1:** DA–OA sigue graficando en la trampa deflacionaria; definición de A en la cruz keynesiana.
- **Macro 2:** inflación por período en el panel de Phillips de DA–OA; notación s·A·f(k) en Solow; eje X por escalones en Phillips.

# FASE 1 --- Arquitectura y modelo de datos

**Proyecto:** Simulador gráfico de autómatas\
**Tecnología:** HTML, CSS y JavaScript puro\
**Documento relacionado:** `SPEC.md`\
**Estado:** Propuesta de arquitectura para revisión y aprobación del
equipo\
**Versión:** 1.0

------------------------------------------------------------------------

## 1. Objetivo de la fase

Definir cómo se organizará la aplicación antes de implementar los
algoritmos. Esta fase establece la estructura de archivos, las
responsabilidades de cada módulo, el modelo de datos de los autómatas,
las interfaces entre componentes y las decisiones técnicas que deben
respetarse durante el desarrollo.

La arquitectura separa los algoritmos de la interfaz para que puedan
probarse sin depender de los elementos visuales.

## 2. Decisiones de arquitectura

1.  La aplicación será local y se abrirá desde `index.html`.
2.  Se utilizarán HTML, CSS y JavaScript nativo, sin servidor ni
    backend.
3.  Los diagramas se dibujarán mediante SVG generado localmente.
4.  El modelo de datos y los algoritmos no manipularán directamente el
    DOM.
5.  La interfaz llamará a funciones de lógica y mostrará sus resultados.
6.  Los algoritmos devolverán datos y pasos explicativos; la interfaz
    será responsable de representarlos.
7.  El proyecto empezará con autómatas sin transiciones ε. El soporte ε
    se añadirá solo después de validar la conversión básica.
8.  Los módulos compartirán un modelo de datos común para evitar
    duplicar definiciones de autómatas.

## 3. Estructura de carpetas propuesta

``` text
Simulador_Automatas/
├── index.html
├── SPEC.md
├── ARQUITECTURA.md
├── README.md
├── css/
│   └── estilos.css
├── js/
│   ├── automatas.js
│   ├── conversion.js
│   ├── expresiones.js
│   ├── verificador.js
│   ├── diagramas.js
│   └── interfaz.js
├── pruebas/
│   └── pruebas.js
└── evidencias/
    └── bitacora_ia.md
```

### Responsabilidades de los archivos

  -----------------------------------------------------------------------
  Archivo                             Responsabilidad
  ----------------------------------- -----------------------------------
  `index.html`                        Estructura semántica, navegación y
                                      contenedores de los módulos.

  `css/estilos.css`                   Presentación visual, distribución,
                                      tablas, formularios y adaptación a
                                      pantallas.

  `js/automatas.js`                   Crear, validar, clonar y normalizar
                                      modelos de autómatas; funciones
                                      básicas de aceptación.

  `js/conversion.js`                  Ejecutar el método de subconjuntos,
                                      crear el AFD, generar la tabla y
                                      registrar los pasos.

  `js/expresiones.js`                 Construir la representación de
                                      expresiones regulares, procesar
                                      ecuaciones y producir pasos de
                                      transformación.

  `js/verificador.js`                 Generar cadenas hasta una longitud
                                      máxima y comparar la aceptación de
                                      las representaciones.

  `js/diagramas.js`                   Dibujar estados y transiciones
                                      mediante SVG, incluyendo flecha
                                      inicial y estados finales.

  `js/interfaz.js`                    Gestionar formularios, botones,
                                      navegación entre módulos, mensajes
                                      y conexión entre interfaz y lógica.

  `pruebas/pruebas.js`                Ejecutar pruebas de los algoritmos
                                      y comprobar los casos de
                                      referencia.

  `ARQUITECTURA.md`                   Documentar decisiones
                                      arquitectónicas y modelo de datos.

  `README.md`                         Instrucciones de ejecución,
                                      funciones y limitaciones conocidas.

  `evidencias/bitacora_ia.md`         Registrar prompts, decisiones,
                                      verificaciones y errores reales del
                                      proceso.
  -----------------------------------------------------------------------

Los archivos JavaScript se cargarán en `index.html` en un orden
explícito mediante etiquetas `<script defer src="..."></script>`. No se
usarán módulos que requieran un servidor local. Se evitará depender de
`fetch()` para leer archivos externos, porque la aplicación debe
funcionar al abrirse directamente desde el sistema de archivos.

## 4. Modelo de datos

### 4.1 Modelo común de un autómata

Se utilizará un objeto JavaScript con esta estructura conceptual:

``` js
const automata = {
  states: ["q0", "q1", "q2"],
  alphabet: ["a", "b"],
  initialState: "q0",
  finalStates: ["q2"],
  transitions: [
    { from: "q0", symbol: "a", to: "q0" },
    { from: "q0", symbol: "a", to: "q1" },
    { from: "q1", symbol: "b", to: "q2" }
  ]
};
```

### 4.2 Significado de los campos

  -----------------------------------------------------------------------
  Campo                   Tipo                    Descripción
  ----------------------- ----------------------- -----------------------
  `states`                `string[]`              Identificadores únicos
                                                  de los estados.

  `alphabet`              `string[]`              Símbolos de entrada
                                                  permitidos. Cada
                                                  símbolo será una unidad
                                                  de texto no vacía.

  `initialState`          `string`                Identificador del
                                                  estado inicial.

  `finalStates`           `string[]`              Estados de aceptación.

  `transitions`           `Transition[]`          Lista de transiciones;
                                                  puede contener varios
                                                  destinos para el mismo
                                                  estado y símbolo en un
                                                  AFND.
  -----------------------------------------------------------------------

Cada transición contiene:

  Campo      Tipo       Descripción
  ---------- ---------- -------------------------------
  `from`     `string`   Estado de origen.
  `symbol`   `string`   Símbolo de entrada consumido.
  `to`       `string`   Estado de destino.

Se usará una lista de transiciones, no un único destino por estado y
símbolo, porque el AFND permite múltiples destinos para la misma
combinación.

### 4.3 Convenciones de datos

-   Los identificadores de estados serán únicos y no estarán vacíos.
-   Los símbolos del alfabeto serán únicos y no estarán vacíos.
-   En la versión básica, cada símbolo será una unidad de texto, por
    ejemplo `a`, `b`, `0` o `1`.
-   Los nombres de estados no se interpretarán como símbolos de entrada.
-   El estado inicial debe pertenecer a `states`.
-   Cada estado final debe pertenecer a `states`.
-   Cada transición debe referirse a estados existentes.
-   El símbolo de cada transición debe pertenecer a `alphabet`, salvo ε
    cuando se habilite formalmente el bonus.
-   El orden de estados en un subconjunto no cambiará su identidad
    lógica. Por ejemplo, `{q0,q1}` y `{q1,q0}` deben tratarse como el
    mismo estado del AFD.
-   No se utilizará el texto `∅` como un estado ordinario definido por
    el usuario; el estado pozo se representará internamente como un
    subconjunto vacío y se mostrará como `∅`.

### 4.4 Representación de los estados del AFD

Los estados del AFD se representarán internamente como arreglos de
identificadores de estados del AFND.

Ejemplo:

``` js
const estadoAFD = ["q0", "q1"];
```

Para comparar subconjuntos se normalizarán ordenando los identificadores
antes de generar una clave. Una función auxiliar conceptual será:

``` js
function claveConjunto(estados) {
  return [...estados].sort().join("|");
}
```

Esta clave solo sirve para identificar conjuntos; los identificadores de
estado deberán validarse para evitar separadores ambiguos o deberá
emplearse una serialización inequívoca, como
`JSON.stringify([...estados].sort())`.

El estado pozo será el arreglo vacío `[]`, cuya clave será la
representación normalizada de ese arreglo. Se mostrará como `∅`.

El resultado de conversión se representará de forma separada del AFND
original:

``` js
const resultadoAFD = {
  states: [
    ["q0"],
    ["q0", "q1"],
    ["q2"],
    []
  ],
  alphabet: ["a", "b"],
  initialState: ["q0"],
  finalStates: [["q2"]],
  transitions: [
    { from: ["q0"], symbol: "a", to: ["q0", "q1"] },
    { from: ["q0"], symbol: "b", to: [] }
  ]
};
```

El ejemplo muestra la forma de los datos; no pretende enumerar todas las
transiciones de un resultado completo.

## 5. Responsabilidades y contratos de los módulos

### 5.1 `automatas.js`

Responsabilidades:

-   Validar la definición de un autómata.
-   Crear una copia independiente del modelo cuando se necesite trabajar
    sin modificar el original.
-   Encontrar destinos desde un estado y un símbolo.
-   Evaluar si un AFND acepta una cadena.
-   Evaluar si un AFD acepta una cadena.
-   Proporcionar utilidades para normalizar conjuntos.

Contratos conceptuales:

``` js
validarAutomata(automata)       // devuelve errores de validación
obtenerDestinos(automata, estado, simbolo)
aceptaAFND(automata, cadena)    // devuelve true o false
aceptaAFD(automata, cadena)     // devuelve true o false
```

Las funciones de validación devolverán errores comprensibles y no
modificarán silenciosamente los datos recibidos.

### 5.2 `conversion.js`

Responsabilidades:

-   Construir el AFD por el método de subconjuntos.
-   Procesar cada subconjunto para cada símbolo del alfabeto.
-   Añadir subconjuntos nuevos a la lista de trabajo.
-   Incluir el estado pozo cuando una transición produzca el conjunto
    vacío.
-   Marcar como finales los subconjuntos que contengan al menos un
    estado final del AFND.
-   Generar la tabla de transición.
-   Devolver un registro de pasos explicativos.

Contrato conceptual:

``` js
convertirAFNDaAFD(afnd)
// devuelve { afd, tabla, pasos }
```

Cada paso debe contener, como mínimo, el subconjunto de origen, el
símbolo procesado, los destinos considerados, el subconjunto destino y
una descripción de si el conjunto destino es nuevo.

### 5.3 `expresiones.js`

Responsabilidades:

-   Definir una representación interna de las expresiones regulares.
-   Construir las ecuaciones según el método indicado por el profesor.
-   Aplicar las reglas de transición simple, varias transiciones, bucle,
    bucle con salida y estado final.
-   Registrar las sustituciones, simplificaciones y la regla usada en
    cada paso.
-   Obtener una expresión final que pueda evaluarse con el verificador.

Contrato conceptual:

``` js
convertirAutomataAER(automata)
// devuelve { expresion, pasos, ecuaciones }
```

La representación interna de ER y el algoritmo concreto de eliminación o
sustitución de estados se deben precisar antes de implementar este
módulo. No se debe manipular la expresión exclusivamente como texto si
eso puede cambiar la precedencia de unión, concatenación o estrella de
Kleene.

### 5.4 `verificador.js`

Responsabilidades:

-   Generar todas las cadenas sobre el alfabeto hasta la longitud máxima
    seleccionada, incluida la cadena vacía.
-   Evaluar las cadenas en el AFND, el AFD y la ER.
-   Identificar discrepancias.
-   Entregar un resumen de resultados.

Contrato conceptual:

``` js
verificarEquivalencia(afnd, afd, expresion, longitudMaxima)
// devuelve { totalCadenas, discrepancias, resultados }
```

El verificador debe dejar claro que la equivalencia se comprueba de
forma exhaustiva solo hasta la longitud máxima indicada. La cantidad de
cadenas para un alfabeto de tamaño `k` y longitud máxima `n` es
`1 + k + k² + ... + kⁿ`; por ello, deberá existir una validación de
límites para evitar que la interfaz se congele con valores excesivos.

### 5.5 `diagramas.js`

Responsabilidades:

-   Dibujar el grafo de estados mediante SVG.
-   Mostrar flecha entrante al estado inicial.
-   Mostrar doble círculo en estados finales.
-   Dibujar y etiquetar las transiciones.
-   Diferenciar el estado pozo.
-   Mantener visibles las etiquetas cuando haya transiciones paralelas o
    bucles.

El módulo recibirá datos del autómata y generará la representación
visual. No alterará la definición lógica del autómata.

### 5.6 `interfaz.js`

Responsabilidades:

-   Gestionar formularios para estados, símbolos y transiciones.
-   Mostrar errores de validación.
-   Llamar a los módulos de lógica.
-   Mostrar tablas, diagramas, pasos y resultados del verificador.
-   Transferir el AFD al módulo de expresión regular.
-   Evitar duplicar algoritmos dentro de los controladores de botones.

## 6. Flujo de datos

### Flujo principal

1.  El usuario define un AFND en la interfaz.
2.  `interfaz.js` recoge los datos y los pasa a `automatas.js` para
    validación.
3.  Si los datos son válidos, `conversion.js` recibe el AFND.
4.  `conversion.js` devuelve el AFD, la tabla y los pasos.
5.  `diagramas.js` dibuja el AFND y el AFD.
6.  `interfaz.js` muestra la tabla y los pasos.
7.  El AFD resultante se entrega a `expresiones.js`.
8.  El módulo ER devuelve la expresión, las ecuaciones y el historial de
    transformaciones.
9.  `verificador.js` compara las tres representaciones.
10. La interfaz presenta las cadenas evaluadas, las discrepancias y el
    resumen.

### Principio de integridad

El AFND original no deberá ser sobrescrito por la conversión. El AFD
será un resultado separado, de modo que el verificador pueda comparar
ambas representaciones.

## 7. Estrategia de pruebas

Las pruebas de lógica deberán poder ejecutarse sin depender de
formularios ni del dibujo SVG. Para ello, las funciones del modelo y los
algoritmos no dependerán del DOM.

Se cubrirán inicialmente:

1.  Validación de autómatas correctos e incorrectos.
2.  Obtención de destinos múltiples en un AFND.
3.  Normalización de subconjuntos.
4.  Conversión del Caso 1 del Anexo A.
5.  Identificación de estados finales del AFD.
6.  Creación y bucles del estado pozo.
7.  Aceptación y rechazo de cadenas por AFND y AFD.
8.  Generación de cadenas hasta una longitud determinada.
9.  Comparación de aceptación y detección de discrepancias.
10. Conversión a ER, con pasos registrados y comprobación del Caso 2.
11. Casos límite definidos en `SPEC.md`.

En la primera implementación se puede utilizar un archivo
`pruebas/pruebas.js` ejecutado desde la propia aplicación o una página
de pruebas local. La estrategia concreta deberá comprobarse con la
restricción de abrir el proyecto mediante `index.html`, sin servidor y
sin internet.

## 8. Orden de implementación recomendado

1.  Modelo y validación en `automatas.js`.
2.  Pruebas de validación y operaciones básicas.
3.  Método de subconjuntos en `conversion.js`.
4.  Pruebas completas del Caso 1 del Anexo A.
5.  Evaluación de cadenas en AFND y AFD.
6.  Generación de cadenas y comparación en `verificador.js`.
7.  Definición formal de la representación de ER y del procedimiento en
    `expresiones.js`.
8.  Pruebas del Caso 2 y validación del resultado.
9.  Dibujo SVG en `diagramas.js`.
10. Integración de formularios y resultados en `interfaz.js`.
11. Pruebas integrales en macOS y Windows.
12. Documentación y revisión final.

## 9. Criterios de aprobación de la Fase 1

La fase se considerará aprobada cuando el equipo haya revisado y
aceptado:

-   La estructura de carpetas.
-   Las responsabilidades de cada archivo.
-   El modelo de datos común.
-   La representación de subconjuntos del AFD.
-   La separación entre lógica e interfaz.
-   Los contratos de entrada y salida de los módulos.
-   El flujo AFND → AFD → ER → verificador.
-   La estrategia para probar los casos de referencia.
-   Las decisiones pendientes sobre la formalización del algoritmo de
    ER.

## 10. Decisiones que deben validarse antes de programar

1.  Confirmar que todos los identificadores de estado se manejarán como
    cadenas únicas.
2.  Confirmar la representación interna de la expresión regular para
    preservar la precedencia.
3.  Precisar el algoritmo de conversión de autómata a ER de acuerdo con
    las reglas del profesor.
4.  Definir límites razonables para la longitud máxima del verificador.
5.  Decidir cómo ejecutar las pruebas automáticamente sin instalar un
    servidor ni depender de internet.
6.  Incorporar ε solo después de que las pruebas básicas de conversión
    pasen.

------------------------------------------------------------------------

**Siguiente fase:** implementar la lógica pura y las pruebas
automáticas, comenzando por la validación del modelo y la conversión
AFND → AFD. Antes de generar código, el equipo debe revisar este diseño
y registrar en la bitácora qué decisiones acepta o modifica.

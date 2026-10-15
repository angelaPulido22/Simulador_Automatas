# SPEC.md --- Especificación del simulador de autómatas

**Asignatura:** Teoría de la Computación\
**Proyecto:** Simulador gráfico de autómatas: conversión de AFND a AFD y
de autómata finito a expresión regular\
**Tecnología seleccionada:** HTML, CSS y JavaScript puro\
**Modalidad:** Trabajo en pareja o grupo de hasta tres estudiantes\
**Fecha límite indicada en el enunciado:** 15 de octubre de 2026\
**Versión del documento:** 1.0

------------------------------------------------------------------------

## 1. Propósito

Desarrollar una aplicación gráfica local que permita construir y editar
autómatas finitos, convertir un autómata finito no determinista (AFND)
en un autómata finito determinista (AFD), obtener una expresión regular
(ER) a partir de un autómata finito y comprobar, mediante generación
exhaustiva de cadenas de longitud limitada, si las representaciones
reconocen las mismas cadenas dentro del rango seleccionado.

La aplicación debe mostrar los procedimientos de forma comprensible,
para que el usuario pueda revisar los cálculos y explicar los resultados
durante la sustentación.

## 2. Alcance

La aplicación incluirá tres módulos conectados:

1.  **AFND → AFD:** editor, método de subconjuntos, tabla de
    transiciones, diagramas y explicación paso a paso.
2.  **Autómata finito → expresión regular:** sistema de ecuaciones,
    aplicación de reglas, sustituciones, simplificaciones y expresión
    final.
3.  **Verificador:** generación de cadenas y comparación de aceptación
    entre AFND, AFD y ER.

Como funcionalidad adicional, se evaluará la implementación de
transiciones ε y clausura-ε, correspondiente al bonus del enunciado.

## 3. Restricciones técnicas

-   Utilizar exclusivamente HTML, CSS y JavaScript del lado del cliente.
-   No combinar esta tecnología con Python ni con otro stack.
-   No utilizar Node.js, servidores, backend ni arquitectura
    cliente-servidor.
-   La aplicación debe funcionar localmente y sin conexión a internet.
-   No utilizar APIs, CDN, fuentes remotas ni servicios externos.
-   Si se incorpora alguna biblioteca externa, deberá estar incluida
    localmente en el repositorio y funcionar sin internet. Se priorizará
    JavaScript nativo.
-   La aplicación debe poder ejecutarse abriendo `index.html` en un
    navegador moderno.
-   Los diagramas se dibujarán con recursos locales del navegador,
    preferiblemente SVG.
-   La lógica de los algoritmos se mantendrá separada de la interfaz
    para facilitar las pruebas.
-   El código deberá ser comprensible para todos los integrantes y cada
    integrante deberá poder explicar cualquier módulo.

## 4. Usuarios y uso previsto

El usuario será un estudiante que necesite crear autómatas, observar los
procedimientos de conversión, revisar los resultados y demostrar el
funcionamiento de los algoritmos en un entorno académico.

El programa también se utilizará durante la sustentación para ejecutar
casos nuevos, explicar pasos concretos y realizar modificaciones
pequeñas.

## 5. Requisitos funcionales

### RF-01. Crear y editar un autómata

La aplicación permitirá definir y modificar:

-   Conjunto de estados.
-   Alfabeto de entrada.
-   Estado inicial.
-   Conjunto de estados finales.
-   Transiciones entre estados.
-   Símbolo de cada transición.

El editor validará que los estados referenciados en las transiciones
existan, que el estado inicial pertenezca al conjunto de estados y que
los estados finales sean válidos.

### RF-02. Validar la definición

Antes de ejecutar los algoritmos, el sistema comprobará que el autómata
tenga una definición válida. Si detecta datos incompletos o
inconsistentes, mostrará un mensaje claro y evitará ejecutar el
algoritmo hasta corregirlos.

Se contemplarán, como mínimo, estos casos:

-   Campos vacíos.
-   Estados duplicados.
-   Estado inicial inexistente.
-   Estados finales inexistentes.
-   Transiciones que utilicen estados no definidos.
-   Símbolos de transición fuera del alfabeto.
-   Alfabeto con un solo símbolo.
-   Estados que no sean alcanzables desde el estado inicial.
-   Ausencia de transiciones para uno o varios símbolos.

### RF-03. Convertir AFND a AFD

La aplicación aplicará el método de subconjuntos:

1.  Tomará como estado inicial del AFD el conjunto que contiene el
    estado inicial del AFND.
2.  Para cada conjunto de estados y cada símbolo del alfabeto, calculará
    la unión de los destinos posibles.
3.  Registrará cada conjunto nuevo y continuará procesándolo hasta que
    no aparezcan conjuntos nuevos.
4.  Marcará como finales los conjuntos que contengan al menos un estado
    final del AFND.
5.  Incluirá el conjunto vacío `∅` como estado pozo cuando resulte de
    una transición.
6.  El estado pozo tendrá una transición hacia sí mismo para cada
    símbolo del alfabeto.

Los conjuntos deberán representarse de manera consistente para evitar
duplicados que contengan los mismos estados en distinto orden.

### RF-04. Mostrar la tabla de conversión

El módulo mostrará una tabla que incluya:

-   Conjunto de estados del AFD.
-   Una columna por cada símbolo del alfabeto.
-   El conjunto destino para cada combinación.
-   Identificación del estado inicial.
-   Identificación de los estados finales.
-   Identificación del estado pozo cuando corresponda.

### RF-05. Dibujar los autómatas

La aplicación dibujará el AFND original y el AFD resultante.

Los diagramas respetarán las convenciones utilizadas en clase:

-   Estados representados mediante óvalos o círculos.
-   Flechas para las transiciones.
-   Flecha entrante sin origen visible para señalar el estado inicial.
-   Doble círculo para los estados finales.
-   Etiquetas legibles en las transiciones.
-   Representación reconocible del estado pozo `∅`.

Cuando existan varias transiciones entre los mismos estados, el diagrama
deberá mostrar sus símbolos sin ocultar información importante.

### RF-06. Explicar la conversión paso a paso

El usuario podrá avanzar por los pasos de la conversión y observar, en
cada uno:

-   Conjunto que se está procesando.
-   Símbolo que se está evaluando.
-   Transiciones del AFND consideradas.
-   Conjunto destino calculado.
-   Si el conjunto destino es nuevo o ya había sido registrado.
-   Si corresponde crear o utilizar el estado pozo.

La explicación deberá coincidir con la tabla final y con el AFD
dibujado.

### RF-07. Obtener una expresión regular

El segundo módulo permitirá trabajar con un autómata finito y obtener
una expresión regular para el lenguaje reconocido.

El módulo deberá:

-   Recibir el AFD producido por el primer módulo.
-   Permitir utilizar un autómata definido en el editor, cuando sea
    válido para el procedimiento implementado.
-   Construir y mostrar el sistema de ecuaciones asociado a los estados.
-   Mostrar cada sustitución y simplificación.
-   Identificar la regla aplicada en cada paso.
-   Presentar la expresión regular resultante.

Se implementarán y documentarán las reglas indicadas en el enunciado del
parcial:

-   **Transición simple:** `p = aq`.
-   **Varias transiciones:** `p = aq + br`.
-   **Bucle:** `p = ap → a*`.
-   **Bucle más salida:** `p = ap + bq → a*·bq`.
-   **Estado final:** `p = λ`.

La implementación deberá conservar correctamente el significado de la
concatenación, la unión, la estrella de Kleene y la cadena vacía. La
notación concreta se definirá en la fase de arquitectura y se utilizará
consistentemente en la interfaz y en las pruebas.

**Criterio de corrección:** la expresión final no se considerará
correcta únicamente porque el procedimiento termine. Se comprobará con
los casos de referencia y con el verificador. Si una regla del enunciado
resulta ambigua al formalizarla, se registrará la decisión adoptada y se
validará con ejemplos antes de darla por implementada.

### RF-08. Verificar las cadenas

El verificador generará todas las cadenas del alfabeto hasta una
longitud máxima `n` indicada por el usuario.

-   La longitud máxima será configurable y tendrá un valor mínimo
    permitido de 6.
-   Se incluirá la cadena vacía `λ` o `ε` en las comprobaciones.
-   Se evaluará cada cadena en el AFND, en el AFD y en la expresión
    regular.
-   Se mostrarán las cadenas aceptadas y rechazadas por cada
    representación.
-   Se señalará cada cadena para la que los resultados sean diferentes.
-   Se mostrará un resumen de la cantidad de cadenas examinadas y de las
    discrepancias encontradas.

El verificador realizará una comprobación exhaustiva únicamente para las
cadenas generadas dentro del límite configurado. No se presentará esa
comprobación finita como una demostración matemática de equivalencia
para cadenas de longitud ilimitada.

### RF-09. Soportar el flujo entre módulos

El resultado de la conversión AFND → AFD deberá poder enviarse al módulo
de expresión regular sin volver a introducir manualmente el autómata.

El verificador podrá comparar el AFND de origen, el AFD resultante y la
expresión regular obtenida, siempre que las tres representaciones estén
disponibles.

### RF-10. Soportar transiciones ε (funcionalidad adicional)

Como funcionalidad adicional, se podrá permitir que el AFND tenga
transiciones ε.

En ese caso, la conversión deberá calcular la clausura-ε del estado
inicial y la clausura-ε de los conjuntos alcanzados en cada paso,
siguiendo el algoritmo que se defina y pruebe en la fase de lógica.

La aplicación distinguirá claramente las transiciones ε de los símbolos
ordinarios del alfabeto. Esta funcionalidad se implementará después de
verificar correctamente la conversión básica sin ε.

## 6. Requisitos no funcionales

### RNF-01. Ejecución local

La aplicación funcionará abriendo `index.html`, sin instalar un servidor
ni iniciar procesos adicionales.

### RNF-02. Funcionamiento sin internet

Las funciones principales estarán disponibles sin conexión. No habrá
solicitudes a servicios externos ni recursos obligatorios alojados en
internet.

### RNF-03. Usabilidad

La interfaz presentará nombres claros, formularios organizados, tablas
legibles, diagramas distinguibles y mensajes de validación
comprensibles.

### RNF-04. Trazabilidad

Los pasos de los algoritmos podrán relacionarse con los resultados
mostrados en las tablas y los diagramas.

### RNF-05. Mantenibilidad

La lógica del modelo, los algoritmos, la visualización y la interacción
se organizarán en archivos separados.

### RNF-06. Verificabilidad

Las funciones principales tendrán pruebas automáticas. Los resultados se
contrastarán con los casos del Anexo A y con cálculos revisados por el
equipo.

### RNF-07. Portabilidad

La aplicación se probará en los navegadores disponibles en macOS y
Windows, sin depender de rutas específicas del sistema operativo.

### RNF-08. Comprensión del código

No se incorporará código que el equipo no pueda explicar. Las decisiones
técnicas y los errores relevantes se documentarán.

## 7. Entradas y salidas

### Entradas

-   Estados del autómata.
-   Símbolos del alfabeto.
-   Estado inicial.
-   Estados finales.
-   Lista de transiciones.
-   Longitud máxima `n` para la verificación.
-   Opcionalmente, transiciones ε cuando la funcionalidad adicional esté
    implementada.

### Salidas

-   Representación gráfica del autómata original.
-   Tabla de transición del AFD.
-   Lista de subconjuntos generados.
-   Explicación paso a paso de la conversión.
-   Representación gráfica del AFD.
-   Sistema de ecuaciones del módulo de expresión regular.
-   Historial de sustituciones y simplificaciones.
-   Expresión regular final.
-   Listado de cadenas examinadas y resultados de aceptación.
-   Resumen de discrepancias encontradas por el verificador.

## 8. Modelo conceptual de datos

La estructura definitiva se especificará en la Fase 1. Como mínimo, un
autómata deberá representar:

-   `states`: conjunto de identificadores de estado.
-   `alphabet`: conjunto de símbolos de entrada.
-   `initialState`: identificador del estado inicial.
-   `finalStates`: conjunto de estados finales.
-   `transitions`: relación de transiciones que permita más de un
    destino para un mismo estado y símbolo.

La representación deberá soportar el no determinismo. Por tanto, no se
asumirá que cada par estado-símbolo tiene un único destino en el AFND.

Para el AFD, cada par estado-conjunto/símbolo deberá tener un destino
único una vez completada la conversión, incluyendo el estado pozo cuando
corresponda.

## 9. Casos de referencia y aceptación

### Caso de referencia 1: AFND → AFD

**Alfabeto:** `{a, b}`\
**Estados:** `{q0, q1, q2}`\
**Estado inicial:** `q0`\
**Estado final:** `q2`\
**Transiciones:**

-   `q0 --a--> q0`
-   `q0 --a--> q1`
-   `q1 --b--> q2`

**Resultado esperado:**

-   Estado inicial del AFD: `{q0}`.
-   `{q0} --a--> {q0,q1}`.
-   `{q0} --b--> ∅`.
-   `{q0,q1} --a--> {q0,q1}`.
-   `{q0,q1} --b--> {q2}`.
-   `{q2}` es final.
-   `{q2} --a--> ∅`.
-   `{q2} --b--> ∅`.
-   `∅ --a--> ∅`.
-   `∅ --b--> ∅`.

El conjunto `{q2}` deberá marcarse como final porque contiene el estado
final `q2` del AFND.

### Caso de referencia 2: autómata → expresión regular

**Alfabeto:** `{x, y}`\
**Estados:** `{q0, q1, q2}`\
**Estado inicial:** `q0`\
**Estado final:** `q1`\
**Transiciones:**

-   `q0 --x--> q1`
-   `q1 --x--> q2`
-   `q2 --y--> q2`
-   `q2 --y--> q1`

El enunciado proporciona como expresión esperada `x ( x y* y )*` y
admite una forma simplificada equivalente si el verificador confirma la
equivalencia. El equipo deberá contrastar esta expresión con el lenguaje
reconocido por el autómata antes de utilizarla como resultado aprobado.

## 10. Casos límite que deben probarse

-   Estado pozo `∅` generado por una transición sin destinos.
-   Estado pozo con bucle para todos los símbolos.
-   Estados inalcanzables desde el estado inicial.
-   Estado inicial que también es final.
-   Autómata con un único símbolo en el alfabeto.
-   Estados sin transiciones salientes.
-   Estados con varias transiciones para el mismo símbolo.
-   Estados con bucles.
-   Transiciones hacia estados finales y no finales.
-   Cadena vacía.
-   Alfabeto o lista de estados vacíos: la aplicación debe rechazarlos
    con un mensaje claro cuando la operación requiera una definición
    válida.
-   Expresión regular con unión, concatenación y estrella de Kleene.
-   Longitud máxima de verificación inferior a 6: debe rechazarse o
    corregirse mediante una validación visible.
-   Representaciones que acepten distintas cadenas: el verificador debe
    mostrar al menos una discrepancia cuando exista dentro del rango
    probado.

## 11. Pruebas y criterios de aceptación

El proyecto se considerará funcionalmente aceptable cuando:

1.  La aplicación abra localmente y funcione sin conexión.
2.  El usuario pueda crear y editar un AFND válido.
3.  La conversión por subconjuntos coincida con el resultado esperado
    del Caso 1.
4.  La tabla y el diagrama del AFD representen los mismos estados y
    transiciones.
5.  El procedimiento paso a paso explique los cálculos realizados.
6.  El módulo de expresión regular muestre ecuaciones, sustituciones,
    simplificaciones y las reglas utilizadas.
7.  El Caso 2 se contraste con el lenguaje del autómata y el
    verificador, documentando cualquier ajuste necesario.
8.  El verificador genere todas las cadenas requeridas hasta la longitud
    seleccionada y reporte discrepancias.
9.  Los errores de entrada produzcan mensajes claros sin dejar la
    aplicación en un estado inconsistente.
10. Las pruebas automáticas cubran, como mínimo, los dos casos del Anexo
    A y los casos límite principales.
11. La funcionalidad adicional de ε, si se incluye, tenga pruebas
    específicas de clausura-ε.
12. Todos los integrantes puedan explicar el código y demostrar la
    ejecución de un autómata nuevo.

## 12. Organización prevista del proyecto

La organización inicial será:

``` text
Simulador_Automatas/
├── index.html
├── README.md
├── SPEC.md
├── css/
│   └── estilos.css
├── js/
│   ├── automatas.js
│   ├── conversion.js
│   ├── expresiones.js
│   ├── verificador.js
│   └── interfaz.js
├── pruebas/
│   └── pruebas.js
└── evidencias/
    └── bitacora_ia.md
```

La estructura podrá ajustarse en la Fase 1 si el equipo documenta y
justifica el cambio. No se incluirán recursos remotos.

## 13. Proceso de desarrollo con IA

El trabajo se organizará en las fases requeridas por el enunciado:

-   **Fase 0 --- Especificación:** completar y aprobar este documento.
-   **Fase 1 --- Arquitectura:** definir el modelo de datos, las
    funciones y la estructura definitiva antes de generar la lógica.
-   **Fase 2 --- Lógica pura:** implementar algoritmos sin interfaz y
    desarrollar pruebas automáticas.
-   **Fase 3 --- Interfaz gráfica:** construir formularios, tablas y
    diagramas.
-   **Fase 4 --- Paso a paso:** incorporar explicaciones verificables de
    cada procedimiento.
-   **Fase 5 --- Depuración:** registrar al menos dos errores reales,
    con síntoma, prompt utilizado, causa y corrección.
-   **Fase 6 --- Revisión final:** refactorizar, comprobar el
    funcionamiento sin internet y completar el README.

La bitácora registrará para cada prompt relevante: número y fase,
IA/modelo utilizado si se conoce, texto completo del prompt, resumen de
la respuesta, decisión del equipo y método de verificación.

Se recomienda utilizar Git con commits claros por fase y mantener
evidencia de las pruebas y de las decisiones del equipo.

## 14. Entregables del parcial

-   Repositorio o carpeta comprimida con el código y el archivo
    `README.md`.
-   Bitácora de prompts en PDF.
-   Video demostrativo de máximo tres minutos mostrando los dos módulos
    y el verificador.
-   Sustentación individual según las indicaciones del docente.

## 15. Riesgos y decisiones pendientes

-   **Formalización de las reglas de conversión a ER:** definir con
    precisión la orientación de las ecuaciones, el tratamiento de los
    estados finales y el orden de eliminación/sustitución antes de
    programar.
-   **Validación de la ER del Caso 2:** verificar que la expresión
    propuesta por el enunciado describa el lenguaje del autómata.
    Registrar el resultado de esa comprobación.
-   **Crecimiento del número de cadenas:** la cantidad de cadenas
    aumenta exponencialmente con la longitud máxima. El verificador
    deberá informar el rango utilizado y manejar límites razonables sin
    ocultar resultados.
-   **Complejidad visual de los diagramas:** garantizar que las
    etiquetas y transiciones sean legibles incluso cuando haya múltiples
    aristas.
-   **Compatibilidad local:** comprobar que la aplicación se ejecute en
    macOS y Windows sin recursos externos.
-   **Transiciones ε:** implementar esta funcionalidad solo después de
    que las pruebas de la conversión básica pasen.

------------------------------------------------------------------------

**Estado del documento:** borrador inicial para revisión del equipo.\
**Siguiente paso:** aprobar o ajustar la especificación y definir el
modelo de datos y la arquitectura en la Fase 1 antes de implementar los
algoritmos.

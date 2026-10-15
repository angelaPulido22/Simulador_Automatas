# Simulador de autómatas finitos

Aplicación académica local para Teoría de la Computación. Implementa definición de autómatas, conversión AFND → AFD por el método de subconjuntos, diagrama SVG, tabla y pasos, conversión a expresión regular por eliminación de estados (GNFA), evaluación de ER y verificador de cadenas.

## Ejecutar la aplicación

1. Descomprime la carpeta completa.
2. Abre `index.html` con un navegador moderno (Chrome, Edge, Firefox o Safari).
3. No requiere internet, instalación de paquetes, servidor, backend ni Node.js para usar la aplicación.
4. Usa **Cargar caso 1** o **Cargar caso 2**, o escribe tu propio autómata. Pulsa **Validar y convertir AFND → AFD** antes de pedir la expresión regular o verificar.

## Formato del autómata

- Estados: separados por comas, por ejemplo `q0, q1, q2`.
- Alfabeto: símbolos separados por comas, por ejemplo `a, b`.
- Estado inicial: un nombre de estado.
- Estados finales: separados por comas.
- Transiciones: origen, símbolo y destino. Un mismo origen y símbolo puede tener varios destinos, por lo que se admite no determinismo.

Los nombres de estado y símbolos no pueden estar vacíos ni duplicados en sus respectivas listas. La versión actual implementa AFND sin transiciones ε; la clausura-ε del bonus no está incluida.

## Expresiones regulares

La conversión general se realiza por eliminación de estados con un GNFA. La expresión producida puede verse distinta a la esperada en una guía y aun así ser equivalente. Operadores del verificador:

- `+`: unión.
- Concatenación implícita: `ab`.
- `*`: estrella de Kleene.
- `(...)`: agrupación.
- `ε` o `λ`: cadena vacía.
- `∅`: lenguaje vacío.

Los símbolos del alfabeto pueden tener varios caracteres; el tokenizador selecciona el símbolo más largo que coincida. Para una prueba manual con símbolos de varios caracteres, sepáralos con comas en el campo de entrada.

## Verificador

Genera todas las cadenas de longitud 0 hasta `n`, incluyendo la cadena vacía. `n` debe ser como mínimo 6. Se limita a 100 000 cadenas para evitar bloquear el navegador. Las comprobaciones son exhaustivas dentro del rango seleccionado, no una demostración formal de equivalencia para cadenas de longitud ilimitada. Si no hay AFD calculado, el resultado compara las representaciones que estén disponibles.

## Pruebas de desarrollo (opcional)

Node.js se usa únicamente para ejecutar las pruebas; no forma parte de la aplicación ni es necesario para abrirla. Desde la carpeta del proyecto, ejecuta:

```bash
node pruebas/pruebas.js
```

## Archivos

- `index.html`: interfaz y carga de scripts.
- `css/estilos.css`: estilos adaptables, en escala de grises.
- `js/automatas.js`: modelo, validación y aceptación de cadenas.
- `js/conversion.js`: método de subconjuntos AFND → AFD.
- `js/expresiones.js`: conversión GNFA y evaluación de expresiones regulares.
- `js/verificador.js`: generación de cadenas y comparación.
- `js/diagramas.js`: diagramas SVG locales.
- `js/interfaz.js`: coordinación de la interfaz.
- `pruebas/pruebas.js`: pruebas automatizadas de desarrollo.
- `SPEC.md` y `ARQUITECTURA.md`: especificación y arquitectura.
- `evidencias/bitacora_ia.md`: plantilla para registrar el proceso real de trabajo con IA.

## Limitaciones conocidas

- No se implementan transiciones ε ni clausura-ε.
- El verificador es de rango finito y está limitado a 100 000 cadenas.
- La conversión a ER puede producir expresiones largas. Su equivalencia debe revisarse con el verificador y con ejemplos del curso.
- Los pasos GNFA muestran la regla general de eliminación de estados; no reproducen literalmente un método manual de ecuaciones por estado si la guía exige exactamente esa presentación.

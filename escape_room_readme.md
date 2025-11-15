# 🎮 Escape Room – Ecuaciones Lineales (Período 4)

Juego educativo interactivo para aprender y practicar ecuaciones lineales mediante la resolución de 4 retos matemáticos.

## 📋 Descripción

Este Escape Room virtual presenta una sala con objetos interactivos que contienen desafíos matemáticos. Los estudiantes trabajan en equipo para resolver ecuaciones lineales en diferentes formatos y escapar del cuarto antes de que se agote el tiempo.

## 🎯 Objetivos de Aprendizaje

- **Reto 1 (Cuadro)**: Forma pendiente–intersección (y = mx + b)
- **Reto 2 (Libros)**: Desplazamiento vertical de gráficas
- **Reto 3 (Caja)**: Forma punto–pendiente
- **Reto 4 (Puerta)**: Aplicación combinada de conceptos

## 🚀 Características

- ⏱️ **Temporizador de 45 minutos**
- 🎯 **1 intento por reto** para mayor desafío
- 💡 **1 pista disponible** por cada reto
- 🔒 **Sistema de bloqueo** para evitar repeticiones (un equipo/sección solo puede jugar una vez)
- 📊 **Generación de PDF** con resultados detallados
- 🎨 **Interfaz visual atractiva** con sala 3D
- 💾 **Almacenamiento local** para registro de intentos

## 📁 Estructura de Archivos

```
escape-room/
│
├── index.html          # Estructura HTML del juego
├── index.css           # Estilos visuales y diseño de la sala
├── index.js            # Lógica del juego, validaciones y mecánicas
└── README.md           # Documentación del proyecto
```

## 🛠️ Instalación

1. Clona o descarga este repositorio
2. Asegúrate de que todos los archivos estén en la misma carpeta:
   - `index.html`
   - `index.css`
   - `index.js`
3. Abre `index.html` en tu navegador web

**Nota**: El juego utiliza jsPDF desde CDN para generar reportes, por lo que necesitas conexión a internet.

## 💻 Uso

### Para Estudiantes

1. **Inicio del juego**:
   - Ingresa los nombres de los integrantes del equipo (separados por coma)
   - Escribe la sección (ejemplo: B1, A2, etc.)
   - Presiona "Entrar al cuarto"

2. **Durante el juego**:
   - Haz clic en los objetos de la sala (Cuadro, Libros, Caja, Puerta)
   - Lee cuidadosamente cada problema matemático
   - Usa las pistas si es necesario (solo 1 por reto)
   - Ingresa tu respuesta y presiona "Enviar"
   - Solo tienes 1 intento por reto

3. **Finalización**:
   - Al completar los 4 retos, podrás descargar el PDF con tus resultados
   - El PDF incluye: respuestas, correcciones, puntaje y nota

### Para Profesores

- El sistema registra cada intento por equipo/sección en el navegador
- Un mismo equipo/sección no puede jugar múltiples veces desde el mismo navegador
- El PDF generado incluye:
  - Fecha y hora del intento
  - Respuestas del estudiante vs. respuestas correctas
  - Puntaje sobre 100 puntos
  - Nota sobre 10 puntos
  - Tiempo empleado

## 🎨 Componentes Visuales

### HUD (Heads-Up Display)
- Temporizador
- Puntaje actual
- Claves desbloqueadas
- Información del equipo
- Estado del juego

### Objetos Interactivos
- 🖼️ **Cuadro**: Reto de pendiente-intersección
- 📚 **Libros**: Reto de desplazamiento
- 📦 **Caja fuerte**: Reto punto-pendiente
- 🚪 **Puerta**: Reto de aplicación combinada

## 🔧 Dependencias

- **jsPDF** (v2.5.1): Para generación de reportes PDF
- **Google Fonts - Poppins**: Tipografía del proyecto

Ambas se cargan automáticamente desde CDN.

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Edge, Safari (versiones recientes)
- ✅ Dispositivos móviles (diseño responsive)
- ⚠️ Requiere JavaScript habilitado
- ⚠️ Requiere LocalStorage habilitado

## 🔐 Sistema de Validación

El juego valida automáticamente las respuestas usando parsers matemáticos que aceptan múltiples formatos:

- Fracciones: `1/2`, `-3/4`
- Decimales: `0.5`, `-2.5`
- Formas de ecuaciones: pendiente-intersección y punto-pendiente

## 📊 Sistema de Puntuación

- Cada reto correcto: **25 puntos**
- Máximo puntaje: **100 puntos**
- Conversión a nota sobre 10: automática

## 🐛 Solución de Problemas

**El juego no inicia:**
- Verifica que todos los archivos estén en la misma carpeta
- Asegúrate de tener conexión a internet
- Revisa que JavaScript esté habilitado

**No puedo jugar de nuevo:**
- El sistema bloquea a equipos que ya jugaron
- Para probar nuevamente, usa otro navegador o borra el LocalStorage

**El PDF no se descarga:**
- Verifica tu conexión a internet
- Comprueba que no haya bloqueadores de pop-ups activos

## 📝 Licencia

Proyecto educativo de uso libre para fines académicos.

## 👨‍💻 Desarrollo

Escape Room desarrollado con:
- HTML5
- CSS3 (con diseño visual moderno y efectos 3D)
- JavaScript Vanilla (ES6+)
- jsPDF para generación de reportes

---

**Versión**: 2.0  
**Período**: 4  
**Tema**: Ecuaciones Lineales
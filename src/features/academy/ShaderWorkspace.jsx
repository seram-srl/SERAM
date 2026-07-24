import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, AlertTriangle, Cpu, Code, CheckCircle2 } from 'lucide-react';
import '../../styles/shader-workspace.css';

// Default GLSL shader code for the lesson
const DEFAULT_SHADER_CODE = `// Escribe tu código GLSL a continuación
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    // Coordenadas normalizadas de la pantalla (de 0.0 a 1.0)
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Gradiente cosinusoidal impulsado por el tiempo y la posición
    vec3 color = 0.5 + 0.5 * cos(u_time * 1.5 + uv.xyx + vec3(0.0, 2.0, 4.0));
    
    // Línea de barrido estilo HUD analógico
    float scanline = sin(uv.y * 120.0 + u_time * 4.0) * 0.04;
    color += vec3(scanline * 0.3, scanline * 0.8, scanline * 0.3);
    
    // Viñeteado radial
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
    
    gl_FragColor = vec4(color * vignette, 1.0);
}`;

export default function ShaderWorkspace() {
    const [editorCode, setEditorCode] = useState(DEFAULT_SHADER_CODE);
    const [runningCode, setRunningCode] = useState(DEFAULT_SHADER_CODE);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileError, setCompileError] = useState(null);
    const [compileSuccess, setCompileSuccess] = useState(true);
    
    // Shader playback controls
    const [isPlaying, setIsPlaying] = useState(true);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
    
    const canvasRef = useRef(null);
    const timeRef = useRef(0);
    const animationFrameId = useRef(null);
    const glRef = useRef(null);
    const programRef = useRef(null);

    // WebGL Initialization & Rendering Loop with Strict Garbage Collection
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            setCompileError("WebGL no está soportado en este navegador.");
            return;
        }
        glRef.current = gl;

        // Resize handler
        const resizeCanvas = () => {
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Vertex Shader Program
        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        let activeProgram = null;
        let activeBuffer = null;

        const initShader = (fsSource) => {
            let vertexShader = null;
            let fragmentShader = null;

            try {
                // Delete previous program and buffer to avoid GPU memory leaks
                if (activeProgram) {
                    gl.useProgram(null);
                    gl.deleteProgram(activeProgram);
                    activeProgram = null;
                }
                if (activeBuffer) {
                    gl.deleteBuffer(activeBuffer);
                    activeBuffer = null;
                }

                // Compile shaders
                vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
                fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

                // Create program
                const program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    throw new Error(`Enlace fallido: ${gl.getProgramInfoLog(program)}`);
                }

                // Detach and delete shader binaries immediately after linking to free VRAM
                gl.detachShader(program, vertexShader);
                gl.detachShader(program, fragmentShader);
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                
                // Clear local variables
                vertexShader = null;
                fragmentShader = null;

                gl.useProgram(program);
                programRef.current = program;
                activeProgram = program;

                // Setup full screen position buffer
                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                const vertices = new Float32Array([
                    -1.0, -1.0,
                     1.0, -1.0,
                    -1.0,  1.0,
                    -1.0,  1.0,
                     1.0, -1.0,
                     1.0,  1.0,
                ]);
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                activeBuffer = positionBuffer;

                const positionLocation = gl.getAttribLocation(program, 'position');
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                setCompileError(null);
                setCompileSuccess(true);
            } catch (err) {
                // Clean up references if compilation fails mid-process
                if (vertexShader) gl.deleteShader(vertexShader);
                if (fragmentShader) gl.deleteShader(fragmentShader);
                setCompileError(err.message);
                setCompileSuccess(false);
            }
        };

        // Initialize with default running shader
        initShader(runningCode);

        // Render loop
        let lastFrameTime = Date.now();
        const render = () => {
            const now = Date.now();
            const delta = (now - lastFrameTime) / 1000.0;
            lastFrameTime = now;

            if (gl && programRef.current) {
                if (isPlaying) {
                    timeRef.current += delta * speedMultiplier;
                }

                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                const timeLocation = gl.getUniformLocation(programRef.current, 'u_time');
                const resolutionLocation = gl.getUniformLocation(programRef.current, 'u_resolution');

                gl.uniform1f(timeLocation, timeRef.current);
                gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
            animationFrameId.current = requestAnimationFrame(render);
        };

        animationFrameId.current = requestAnimationFrame(render);

        // Strict cleanup function to prevent memory leaks in GPU (Garbage Collection)
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId.current);
            
            gl.useProgram(null);
            if (activeProgram) {
                gl.deleteProgram(activeProgram);
            }
            if (activeBuffer) {
                gl.deleteBuffer(activeBuffer);
            }
            
            // Force lose WebGL context to completely purge GPU VRAM allocation
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) {
                ext.loseContext();
            }
        };
    }, [runningCode, isPlaying, speedMultiplier]);

    // Helper to compile individual shaders
    const compileShader = (gl, source, type) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(info);
        }
        return shader;
    };

    // Simulated Asynchronous Compiler Trigger
    const handleCompile = () => {
        setIsCompiling(true);
        setCompileSuccess(false);
        setCompileError(null);

        // Async simulation matching Supabase / compiler transport layout (1200ms)
        setTimeout(() => {
            setIsCompiling(false);
            setRunningCode(editorCode);
        }, 1200);
    };

    const handleResetTime = () => {
        timeRef.current = 0;
    };

    return (
        <main className="workspace-viewport min-h-screen flex flex-col lg:flex-row items-stretch justify-center p-4 lg:p-8 gap-6 bg-[#020202]">
            
            {/* PANEL IZQUIERDO: Editor e Instrucciones (40% de ancho) */}
            <section className="w-full lg:w-[40%] flex flex-col gap-5 workspace-glass-card p-6 border border-[#2e5925]/15 pointer-events-auto bg-[#050505]/45 backdrop-blur-[20px] justify-between text-left">
                
                {/* Cabecera del Editor */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-[#00e03c]/10 border border-[#00e03c]/20 text-[#00e03c]">
                                <Cpu className="w-4 h-4" />
                            </span>
                            <span className="text-[10px] font-bold tracking-widest text-[#00e03c] uppercase font-tech">
                                Shader Compiler v2.5
                            </span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">
                            GLSL ES 1.0
                        </span>
                    </div>

                    {/* Título de la Lección */}
                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase font-display">
                            Lección: <span className="text-gradient-premium">Gradientes Cosinusoidales</span>
                        </h2>
                        <p className="text-xs text-gray-400 font-light leading-relaxed">
                            Aprende a formular transiciones de color orgánicas en la GPU mediante interpolación armónica. Edita el vector de fase y compila para ver los cambios en tiempo real.
                        </p>
                    </div>
                </div>

                {/* Editor de Código */}
                <div className="flex-1 flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 font-mono px-1">
                        <Code className="w-3.5 h-3.5 text-[#00e03c]" /> editor.glsl
                    </div>
                    
                    <div className="relative flex-1 min-h-[250px] lg:min-h-[350px] rounded-xl overflow-hidden border border-white/5 bg-[#030303] shadow-inner font-mono text-xs flex">
                        {/* Números de Línea */}
                        <div className="bg-white/[0.02] border-r border-white/5 text-gray-600 select-none py-4 px-2.5 text-right flex flex-col gap-1 min-w-[32px]">
                            {Array.from({ length: editorCode.split('\n').length }).map((_, i) => (
                                <span key={i} className="leading-5 h-5 block text-[10px]">{i + 1}</span>
                            ))}
                        </div>
                        {/* Editor de Texto */}
                        <textarea
                            value={editorCode}
                            onChange={(e) => setEditorCode(e.target.value)}
                            spellCheck="false"
                            className="flex-1 bg-transparent text-gray-300 py-4 px-3 focus:outline-none focus:ring-0 resize-none font-mono leading-5 overflow-y-auto w-full selection:bg-[#00e03c]/20"
                            style={{ tabSize: 4 }}
                        />
                    </div>
                </div>

                {/* Debugger / Consola de Errores */}
                <AnimatePresence mode="wait">
                    {compileError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 font-mono text-[10px] leading-relaxed flex items-start gap-3"
                        >
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                            <div className="flex-1">
                                <span className="font-bold block uppercase tracking-wide text-red-500 mb-1">
                                    [GLSL COMPILATION ERROR]
                                </span>
                                <span className="whitespace-pre-wrap">{compileError}</span>
                            </div>
                        </motion.div>
                    )}

                    {!compileError && compileSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-4 p-3.5 rounded-xl bg-[#00e03c]/5 border border-[#00e03c]/20 text-gray-300 font-mono text-[10px] flex items-center gap-3"
                        >
                            <CheckCircle2 className="w-4 h-4 text-[#00e03c]" />
                            <span className="uppercase tracking-wide font-bold text-[#00e03c]">
                                Pipeline GLSL Compilado Exitosamente
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Botón de Compilación */}
                <div className="mt-5">
                    <button
                        onClick={handleCompile}
                        disabled={isCompiling}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00e03c] hover:bg-[#00c034] disabled:bg-emerald-950/30 disabled:text-[#00e03c]/50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-98 shadow-[0_0_20px_rgba(0,224,60,0.15)] disabled:shadow-none font-display disabled:cursor-not-allowed border border-transparent disabled:border-emerald-950/40"
                    >
                        {isCompiling ? (
                            <>
                                <span className="w-4 h-4 border-2 border-emerald-900 border-t-[#00e03c] rounded-full animate-spin" />
                                Compilando en GPU...
                            </>
                        ) : (
                            <>
                                <Cpu className="w-4 h-4" />
                                Compilar Shader
                            </>
                        )}
                    </button>
                </div>
            </section>

            {/* PANEL DERECHO: Canvas de Ejecución en Tiempo Real (60% de ancho) */}
            <section className="w-full lg:w-[60%] flex flex-col gap-4 pointer-events-auto">
                
                {/* Contenedor del Lienzo WebGL */}
                <div className="relative flex-1 bg-[#030303] border border-white/5 rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:min-h-[60vh] flex items-center justify-center">
                    
                    <canvas
                        ref={canvasRef}
                        className={`w-full h-full block transition-opacity duration-500 ${isCompiling ? 'opacity-30' : 'opacity-100'}`}
                    />

                    {/* Overlay de Carga (Compilando) */}
                    <AnimatePresence>
                        {isCompiling && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#020202]/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-pulse-skeleton"
                            >
                                <div className="p-4 bg-emerald-950/20 border border-[#00e03c]/30 rounded-2xl flex items-center justify-center">
                                    <span className="w-8 h-8 border-4 border-emerald-900 border-t-[#00e03c] rounded-full animate-spin" />
                                </div>
                                <span className="text-xs font-black tracking-widest text-[#00e03c] uppercase font-tech">
                                    Transfiriendo Pipeline GLSL a GPU...
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controles del Reproductor del Shader */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    
                    {/* Botones Play/Pause/Reset */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPlaying(prev => !prev)}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 active:scale-95 transition-all"
                            title={isPlaying ? "Pausar tiempo" : "Reanudar tiempo"}
                        >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                        </button>
                        <button
                            onClick={handleResetTime}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 active:scale-95 transition-all"
                            title="Reiniciar tiempo"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Barra de control de velocidad */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                            Time Speed: {speedMultiplier.toFixed(1)}x
                        </span>
                        <input
                            type="range"
                            min="0.1"
                            max="3.0"
                            step="0.1"
                            value={speedMultiplier}
                            onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                            className="w-24 accent-[#00e03c] cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                    </div>

                    {/* Información del Estado del Shader */}
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00e03c] animate-pulse" />
                        <span className="text-[10px] text-gray-400 font-mono">
                            u_time: {timeRef.current.toFixed(2)}s
                        </span>
                    </div>
                </div>
            </section>
        </main>
    );
}

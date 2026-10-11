# Infraestructura de Automatización Aislada — SERAM (n8n + Docker)

Este directorio contiene el entorno de **n8n de SERAM** configurado para trabajar de manera **100% independiente** de tus proyectos personales y listo para migrar a un servidor **VPS** en producción cuando la empresa lo decida.

---

## 🔒 Reglas de Oro de este Entorno

1. **Puerto Exclusivo de SERAM (`5679`):**  
   Tu n8n personal funciona en el puerto tradicional `5678`. SERAM **NUNCA** toca ese puerto. Toda la plataforma de SERAM corre en `http://localhost:5679`.
2. **Datos físicos en tu disco (`./data`):**  
   A diferencia de configuraciones convencionales donde Docker oculta los datos, aquí la base de datos completa de SERAM (usuarios, credenciales, historial) se guarda en la carpeta visible `d:\SERAM\n8n\data`.
3. **Clave de Encriptación Maestra (`N8N_ENCRYPTION_KEY`):**  
   Fijada en el archivo `.env`. Esto garantiza que cuando lleves esta carpeta al VPS de SERAM, **ninguna credencial ni conexión a APIs se romperá**.
4. **Respaldo de Flujos en JSON (`./workflows`):**  
   Puedes exportar tus flujos como archivos de texto JSON listos para compartirlos con tus socios o guardarlos en Git.

---

## 🚀 Cómo Usar este Entorno (Guía Paso a Paso)

### 1. Iniciar Docker Desktop
Asegúrate de tener abierta la aplicación **Docker Desktop** en tu computadora (ícono de la ballena cerca del reloj de Windows).

### 2. Encender el n8n de SERAM
Abre una terminal PowerShell y corre:
```powershell
cd d:\SERAM\n8n
docker compose up -d
```
> El parámetro `-d` significa *detached* (se queda corriendo en segundo plano sin bloquear tu terminal).

### 3. Abrir n8n en el Navegador
Entra a tu navegador web favorito e ingresa a:
👉 **[http://localhost:5679](http://localhost:5679)**

La primera vez te pedirá crear la cuenta de administrador de SERAM (guarda bien ese usuario y contraseña).

### 4. Apagar o Pausar el n8n de SERAM
Cuando termines de trabajar y quieras liberar memoria RAM:
```powershell
cd d:\SERAM\n8n
docker compose down
```
*(Tus datos y flujos quedan guardados a salvo en la carpeta `data/`).*

---

## 💾 Respaldo de Flujos (Workflows) con 1 Clic

Para guardar una copia en limpio de todos los flujos de automatización creados:
```powershell
cd d:\SERAM\n8n
.\backup-workflows.ps1
```
Esto generará el archivo `workflows/all_workflows_backup.json` listo para guardar en el repositorio o compartir con tus socios.

---

## 🌐 Cómo se Trasladará al VPS de SERAM en el Futuro

Cuando contraten el servidor VPS para SERAM:
1. Copian la carpeta completa `n8n` al servidor Linux (o hacen un `git clone`).
2. En el servidor ejecutan `docker compose up -d`.
3. **¡Listo!** Tendrán exactamente los mismos flujos, credenciales, usuarios y configuraciones funcionando en la nube para todos los socios, sin tener que reconstruir nada desde cero.

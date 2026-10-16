# HelpDesk - Asignación Ponderada

Proyecto académico basado en la estructura entregada: Node.js + Express + PostgreSQL + Swagger.

## 1. Requisitos
- Node.js LTS
- PostgreSQL
- Git
- VS Code recomendado

## 2. Crear la base de datos
En pgAdmin o psql:

```sql
CREATE DATABASE helpdesk_db;
```

## 3. Configurar variables
Copia `.env.example` como `.env` y coloca la contraseña de PostgreSQL.

## 4. Instalar y ejecutar

```bash
npm install
npm run dev
```

La aplicación queda en `http://localhost:3000` y Swagger en `http://localhost:3000/api-docs`.

## 5. Probar el flujo
1. Crear usuarios.
2. Crear agentes usando usuarios.
3. Crear skills y asociarlas a agentes.
4. Crear un ticket con `required_skill_id`.
5. Ejecutar `POST /api/tickets/{id}/auto-assign`.
6. El algoritmo pondera: Skills 50%, disponibilidad 20%, carga 20%, cumplimiento SLA 10%.
7. El vencimiento del SLA excluye sábados, domingos y horas fuera de 08:00-17:00.

## 6. GitHub
Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "feat: sistema helpdesk con asignacion ponderada"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/helpdesk-weighted-assignment.git
git push -u origin main
```

No subas `.env`; ya está incluido en `.gitignore`.

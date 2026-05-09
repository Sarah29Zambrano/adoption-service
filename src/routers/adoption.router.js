/**
 * @swagger
 * tags:
 *   name: Adoptions
 *   description: Gestión de adopciones de mascotas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Adoption:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         petId:
 *           type: integer
 *           example: 123
 *         userId:
 *           type: integer
 *           example: 456
 *         status:
 *           type: string
 *           enum: [pending, adopted]
 *           example: adopted
 *     AdoptionInput:
 *       type: object
 *       required: [petId, userId]
 *       properties:
 *         petId:
 *           type: integer
 *           example: 123
 *         userId:
 *           type: integer
 *           example: 456
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         status:
 *           type: integer
 */

/**
 * @swagger
 * /adoptions:
 *   get:
 *     summary: Listar todas las adopciones
 *     tags: [Adoptions]
 *     responses:
 *       200:
 *         description: Lista de adopciones exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Adoption'
 *             example:
 *               - id: 1
 *                 petId: 123
 *                 userId: 456
 *                 status: adopted
 */

/**
 * @swagger
 * /adoptions:
 *   post:
 *     summary: Crear una nueva adopción
 *     tags: [Adoptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdoptionInput'
 *     responses:
 *       200:
 *         description: Adopción creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *             example:
 *               id: 2
 *               petId: 123
 *               userId: 456
 *               status: pending
 *       400:
 *         description: Datos inválidos o usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /adoptions/{id}:
 *   get:
 *     summary: Obtener una adopción por ID
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la adopción
 *         example: 1
 *     responses:
 *       200:
 *         description: Adopción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *       404:
 *         description: Adopción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const express = require('express');
const { handleCommand } = require('../services/index');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json(handleCommand({ method: 'GET', endpoint: '/adoptions' }));
});

router.post('/', (req, res) => {
  const result = handleCommand({ method: 'POST', endpoint: '/adoptions', body: req.body });
  res.status(result.status || 200).json(result);
});

router.get('/:id', (req, res) => {
  const result = handleCommand({ method: 'GET', endpoint: `/adoptions/${req.params.id}` });
  res.status(result.status || 200).json(result);
});

module.exports = router;
const express = require("express");
const { getActivosPorTipo } = require("../controllers/reportesController");
const router = express.Router();

router.get("/activos-por-tipo", getActivosPorTipo);

module.exports = router;

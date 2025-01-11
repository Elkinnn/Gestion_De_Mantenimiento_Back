const express = require("express");
const { getActivosPorTipo, getComponentesMasUtilizados } = require("../controllers/reportesController");
const router = express.Router();

router.get("/activos-por-tipo", getActivosPorTipo);
router.get("/componentes-mas-utilizados", getComponentesMasUtilizados);

module.exports = router;

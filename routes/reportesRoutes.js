const express = require("express");
const { getActivosPorTipo, getComponentesMasUtilizados, getActividadesMasUtilizadas, getMantenimientosPorPeriodo } = require("../controllers/reportesController");
const router = express.Router();

router.get("/activos-por-tipo", getActivosPorTipo);
router.get("/componentes-mas-utilizados", getComponentesMasUtilizados);
router.get("/actividades-mas-utilizadas", getActividadesMasUtilizadas);
router.get("/mantenimientos-por-periodo", getMantenimientosPorPeriodo);

module.exports = router;

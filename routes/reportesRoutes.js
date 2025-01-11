const express = require("express");
const { getActivosPorTipo, getComponentesMasUtilizados, getActividadesMasUtilizadas } = require("../controllers/reportesController");
const router = express.Router();

router.get("/activos-por-tipo", getActivosPorTipo);
router.get("/componentes-mas-utilizados", getComponentesMasUtilizados);
router.get("/actividades-mas-utilizadas", getActividadesMasUtilizadas);

module.exports = router;

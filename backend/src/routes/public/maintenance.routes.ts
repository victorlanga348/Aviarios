import { Router } from "express";
import { checkMaintenanceStatus, updateMaintenance } from "../../services/maintenanceService.js";
import { authMiddleware } from "../../middlewares/auth.js";
import { adminMiddleware } from "../../middlewares/admin.js";

const router = Router();

// Endpoint público para checar status da manutenção
router.get("/", async (req, res) => {
    try {
        const status = await checkMaintenanceStatus();
        res.status(200).json(status);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Erro ao checar status de manutenção." });
    }
});

// Endpoint administrativo para atualizar configurações de manutenção
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            isActive,
            status,
            type,
            clientName,
            equipment,
            description,
            estimatedTime,
            scheduledStart,
            durationHours,
            leadTimeHours,
        } = req.body;
        const config = await updateMaintenance({
            isActive: Boolean(isActive),
            status,
            type,
            clientName,
            equipment,
            description,
            estimatedTime,
            scheduledStart,
            durationHours: durationHours ? Number(durationHours) : null,
            leadTimeHours: leadTimeHours ? Number(leadTimeHours) : null,
        });
        res.status(200).json({ message: "Configuração de manutenção atualizada com sucesso.", config });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Erro ao atualizar configuração de manutenção." });
    }
});

export default router;

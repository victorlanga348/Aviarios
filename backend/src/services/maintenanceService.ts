import prisma from "../config/db.js";

async function checkMaintenanceStatus() {
    const maintenance = await prisma.maintenance.findUnique({
        where: { id: "global" }
    });

    if (!maintenance) {
        return {
            inMaintenance: false,
            showAlert: false,
            maintenance: null
        };
    }

    const now = new Date();

    // 1. Manutenção Imediata ativa
    if (maintenance.isActive) {
        return {
            inMaintenance: true,
            showAlert: false,
            estimatedTime: maintenance.estimatedTime || "Tempo indeterminado",
            maintenance
        };
    }

    // 2. Manutenção Agendada ativa ou em janela de aviso
    if (maintenance.scheduledStart) {
        const start = new Date(maintenance.scheduledStart);
        const duration = maintenance.durationHours || 2;
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

        // Se está dentro do período agendado
        if (now >= start && now <= end) {
            return {
                inMaintenance: true,
                showAlert: false,
                estimatedTime: `${duration} horas`,
                maintenance
            };
        }

        // Se o prazo de antecedência foi configurado, verifica se exibe o alerta de aviso prévio
        if (maintenance.leadTimeHours) {
            const alertWindowStart = new Date(start.getTime() - maintenance.leadTimeHours * 60 * 60 * 1000);
            if (now >= alertWindowStart && now < start) {
                const diffMs = start.getTime() - now.getTime();
                const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);
                
                return {
                    inMaintenance: false,
                    showAlert: true,
                    timeLeftText: diffDays > 0 
                        ? `Faltam ${diffDays} dia(s) e ${diffHours % 24} hora(s) para a manutenção agendada.`
                        : `Faltam ${diffHours} hora(s) para a manutenção agendada.`,
                    scheduledStart: maintenance.scheduledStart,
                    durationHours: maintenance.durationHours,
                    estimatedTime: maintenance.estimatedTime || `${duration} horas`,
                    maintenance
                };
            }
        }
    }

    return {
        inMaintenance: false,
        showAlert: false,
        maintenance
    };
}

async function updateMaintenance(data: {
    isActive: boolean;
    estimatedTime?: string;
    scheduledStart?: string | null;
    durationHours?: number | null;
    leadTimeHours?: number | null;
}) {
    return await prisma.maintenance.upsert({
        where: { id: "global" },
        create: {
            id: "global",
            isActive: data.isActive,
            estimatedTime: data.estimatedTime || null,
            scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null,
            durationHours: data.durationHours || null,
            leadTimeHours: data.leadTimeHours || null,
        },
        update: {
            isActive: data.isActive,
            estimatedTime: data.estimatedTime || null,
            scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null,
            durationHours: data.durationHours || null,
            leadTimeHours: data.leadTimeHours || null,
        }
    });
}

export { checkMaintenanceStatus, updateMaintenance };

import prisma from "../config/db.js";

type MaintenanceStatus = "PENDENTE" | "AGENDADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";

function resolveStatus(data: {
    isActive: boolean;
    status?: MaintenanceStatus;
    scheduledStart?: string | null;
}) {
    if (data.status) return data.status;
    if (data.isActive) return "EM_ANDAMENTO";
    if (data.scheduledStart) return "AGENDADA";
    return "PENDENTE";
}

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
    const scheduledStart = maintenance.scheduledStart ? new Date(maintenance.scheduledStart) : null;
    const hasUpcomingMaintenance = Boolean(scheduledStart && scheduledStart > now);
    const estimatedTime = maintenance.estimatedTime || (maintenance.durationHours ? `${maintenance.durationHours} horas` : "Tempo indeterminado");
    const scheduledInfo = hasUpcomingMaintenance
        ? {
            scheduledStart: maintenance.scheduledStart,
            durationHours: maintenance.durationHours,
            leadTimeHours: maintenance.leadTimeHours,
            estimatedTime,
        }
        : {};

    if (maintenance.isActive) {
        return {
            inMaintenance: true,
            showAlert: false,
            estimatedTime: maintenance.estimatedTime || "Tempo indeterminado",
            maintenance
        };
    }

    if (scheduledStart) {
        const start = scheduledStart;
        const duration = maintenance.durationHours;

        if (duration) {
            const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

            if (now >= start && now <= end) {
                return {
                    inMaintenance: true,
                    showAlert: false,
                    estimatedTime,
                    maintenance
                };
            }
        } else if (now >= start) {
            return {
                inMaintenance: true,
                showAlert: false,
                estimatedTime,
                maintenance
            };
        }

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
                    leadTimeHours: maintenance.leadTimeHours,
                    estimatedTime,
                    maintenance
                };
            }
        }
    }

    return {
        inMaintenance: false,
        showAlert: hasUpcomingMaintenance,
        ...scheduledInfo,
        maintenance
    };
}

async function updateMaintenance(data: {
    isActive: boolean;
    status?: MaintenanceStatus;
    type?: string;
    clientName?: string | null;
    equipment?: string | null;
    description?: string | null;
    estimatedTime?: string;
    scheduledStart?: string | null;
    durationHours?: number | null;
    leadTimeHours?: number | null;
}) {
    const status = resolveStatus(data);
    const shouldClearSchedule = status === "CONCLUIDA" || status === "CANCELADA" || status === "PENDENTE";
    const isActive = status === "EM_ANDAMENTO";

    return await prisma.maintenance.upsert({
        where: { id: "global" },
        create: {
            id: "global",
            status,
            type: data.type?.trim() || "Sistema",
            clientName: data.clientName?.trim() || null,
            equipment: data.equipment?.trim() || null,
            description: data.description?.trim() || null,
            isActive,
            estimatedTime: data.estimatedTime || null,
            scheduledStart: !shouldClearSchedule && data.scheduledStart ? new Date(data.scheduledStart) : null,
            durationHours: shouldClearSchedule ? null : data.durationHours || null,
            leadTimeHours: shouldClearSchedule ? null : data.leadTimeHours || null,
        },
        update: {
            status,
            type: data.type?.trim() || "Sistema",
            clientName: data.clientName?.trim() || null,
            equipment: data.equipment?.trim() || null,
            description: data.description?.trim() || null,
            isActive,
            estimatedTime: data.estimatedTime || null,
            scheduledStart: !shouldClearSchedule && data.scheduledStart ? new Date(data.scheduledStart) : null,
            durationHours: shouldClearSchedule ? null : data.durationHours || null,
            leadTimeHours: shouldClearSchedule ? null : data.leadTimeHours || null,
        }
    });
}

export { checkMaintenanceStatus, updateMaintenance };

import type { Request, Response } from "express";
import { createClient, listClients } from "../services/clientService.js";

const createClientController = async (req: Request, res: Response) => {
    try {
        const { name, phone } = req.body;
        const client = await createClient(name, phone);
        res.status(201).json(client);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listClientsController = async (req: Request, res: Response) => {
    try {
        const clients = await listClients();
        res.status(200).json(clients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listClientByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const clients = await listClients();
        const filteredClients = clients.filter((client) => client.name.includes(name as string));
        res.status(200).json(filteredClients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

const listClientByPhone = async (req: Request, res: Response) => {
    try {
        const { phone } = req.params;
        const clients = await listClients();
        const filteredClients = clients.filter((client) => client.phone?.includes(phone as string));
        res.status(200).json(filteredClients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { createClientController, listClientsController, listClientByName, listClientByPhone }
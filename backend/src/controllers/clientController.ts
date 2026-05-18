import type { Request, Response } from "express";
import { createClient, listClients, deleteClient } from "../services/clientService.js";
import { getErrorMessage } from '../types/express.js';

const createClientController = async (req: Request, res: Response) => {
    try {
        const { name, phone } = req.body as { name: string; phone?: string };
        const client = await createClient(req.userId!, name, phone);
        res.status(201).json(client);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listClientsController = async (req: Request, res: Response) => {
    try {
        const clients = await listClients(req.userId!);
        res.status(200).json(clients);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listClientByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.params as { name: string };
        const clients = await listClients(req.userId!);
        const filteredClients = clients.filter((client) => client.name.includes(name));
        res.status(200).json(filteredClients);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const listClientByPhone = async (req: Request, res: Response) => {
    try {
        const { phone } = req.params as { phone: string };
        const clients = await listClients(req.userId!);
        const filteredClients = clients.filter((client) => client.phone?.includes(phone));
        res.status(200).json(filteredClients);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

const deleteClientController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const result = await deleteClient(req.userId!, id);
        res.status(200).json(result);
    } catch (error: unknown) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};

export { 
    createClientController, 
    listClientsController, 
    listClientByName, 
    listClientByPhone,
    deleteClientController 
};
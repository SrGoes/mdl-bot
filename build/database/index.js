import fs from "node:fs";
import path from "node:path";
const DB_PATH = path.join(process.cwd(), "database.json");
function loadDb() {
    if (!fs.existsSync(DB_PATH)) {
        const initialDb = { counter: 0, members: [] };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
        return initialDb;
    }
    try {
        const data = fs.readFileSync(DB_PATH, "utf-8");
        const parsed = JSON.parse(data);
        let changed = false;
        if (!parsed.counter && parsed.counter !== 0) {
            parsed.counter = parsed.members.length;
            changed = true;
        }
        // Migração: Garante que todos os membros existentes tenham um registrationId
        for (let i = 0; i < parsed.members.length; i++) {
            if (parsed.members[i].registrationId === undefined) {
                parsed.members[i].registrationId = i + 1;
                changed = true;
            }
        }
        if (changed) {
            // Atualiza o counter para o maior ID encontrado
            const maxId = parsed.members.reduce((max, m) => Math.max(max, m.registrationId || 0), 0);
            parsed.counter = Math.max(parsed.counter, maxId);
            saveDb(parsed);
        }
        return parsed;
    }
    catch (e) {
        return { counter: 0, members: [] };
    }
}
function saveDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
export const db = {
    members: {
        async findUnique(id, guildId) {
            const data = loadDb();
            return data.members.find(m => m.id === id && m.guildId === guildId);
        },
        async getRegistrationId(id, guildId) {
            console.log(`[DB DEBUG] getRegistrationId called for ${id} in ${guildId}`);
            const data = loadDb();
            const member = data.members.find(m => m.id === id && m.guildId === guildId);
            if (member && member.registrationId !== undefined) {
                console.log(`[DB DEBUG] Found existing member with ID ${member.registrationId}`);
                return member.registrationId;
            }
            // Se não existe ou está sem ID, vamos "reservar" o próximo ID para esse usuário
            data.counter++;
            const newId = data.counter;
            console.log(`[DB DEBUG] Reserving NEW ID ${newId} for ${id}`);
            if (member) {
                member.registrationId = newId;
            }
            else {
                data.members.push({
                    id,
                    guildId,
                    registrationId: newId,
                    realName: "",
                    characterName: "",
                    cityId: "",
                    updatedAt: new Date().toISOString()
                });
            }
            saveDb(data);
            return newId;
        },
        async upsert(id, guildId, payload) {
            const data = loadDb();
            const index = data.members.findIndex(m => m.id === id && m.guildId === guildId);
            const now = new Date().toISOString();
            let registrationId;
            if (index !== -1) {
                registrationId = data.members[index].registrationId;
                data.members[index] = { ...data.members[index], ...payload, updatedAt: now };
            }
            else {
                data.counter++;
                registrationId = data.counter;
                data.members.push({ id, guildId, registrationId, ...payload, updatedAt: now });
            }
            saveDb(data);
            return registrationId;
        },
        async getAll() {
            return loadDb().members;
        }
    }
};
// Mantendo compatibilidade com o que já foi escrito se necessário
export const prisma = db;

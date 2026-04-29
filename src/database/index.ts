import { PrismaClient } from "./prisma";

const prismaClient = new PrismaClient();

export const db = {
    members: {
        async findUnique(id: string, guildId: string) {
            return await prismaClient.member.findUnique({
                where: {
                    id_guildId: { id, guildId }
                }
            });
        },
        async getRegistrationId(id: string, guildId: string) {
            const member = await prismaClient.member.findUnique({
                where: {
                    id_guildId: { id, guildId }
                },
                select: { registrationId: true }
            });

            if (member) return member.registrationId;

            // Se não existe, cria um membro básico para gerar o ID automático
            const newMember = await prismaClient.member.upsert({
                where: {
                    id_guildId: { id, guildId }
                },
                update: {},
                create: {
                    id,
                    guild: {
                        connectOrCreate: {
                            where: { id: guildId },
                            create: { id: guildId }
                        }
                    }
                }
            });

            return newMember.registrationId;
        },
        async upsert(id: string, guildId: string, payload: {
            realName?: string;
            characterName?: string;
            cityId?: string;
            recruiter?: string;
        }) {
            const member = await prismaClient.member.upsert({
                where: {
                    id_guildId: { id, guildId }
                },
                update: {
                    ...payload,
                },
                create: {
                    id,
                    ...payload,
                    guild: {
                        connectOrCreate: {
                            where: { id: guildId },
                            create: { id: guildId }
                        }
                    }
                }
            });
            return member.registrationId;
        },
        async getAll() {
            return await prismaClient.member.findMany();
        }
    }
};

export const prisma = prismaClient;

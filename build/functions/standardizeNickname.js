import constants from "../../constants.json" with { type: "json" };
import { db } from "../database/index.js";
/**
 * Padroniza o apelido do membro com base no seu cargo mais alto da hierarquia.
 * Formato: [Prefix] Nome | ID
 */
export async function standardizeNickname(member) {
    if (member.user.bot)
        return;
    // Se for o dono do servidor, o bot geralmente não tem permissão para mudar o nick
    if (member.guild.ownerId === member.id)
        return;
    const hierarchy = constants.hierarchy.roles;
    // Encontra o cargo mais alto que o membro possui na lista da hierarquia
    const highestRoleConfig = hierarchy.find(roleConfig => member.roles.cache.has(roleConfig.id));
    if (!highestRoleConfig)
        return;
    const prefix = highestRoleConfig.prefix;
    // 1. Tenta buscar os dados reais no Banco de Dados JSON para evitar nomes cortados
    const dbMember = await db.members.findUnique(member.id, member.guild.id);
    let cleanNick = "";
    if (dbMember) {
        // Se temos no banco, usamos os dados íntegros
        cleanNick = `${dbMember.characterName} | ${dbMember.cityId}`;
    }
    else {
        // Se não tem no banco, tenta extrair do apelido atual (Fallback)
        const currentNick = member.nickname || member.user.globalName || member.user.username;
        // Remove qualquer prefixo antigo (ex: [M], [L], etc)
        cleanNick = currentNick.replace(/^\[.*?\]\s*/, "");
    }
    const newNickname = `[${prefix}] ${cleanNick}`.slice(0, 32);
    if (member.nickname !== newNickname) {
        try {
            await member.setNickname(newNickname);
            console.log(`Apelido de ${member.user.tag} padronizado para: ${newNickname}`);
        }
        catch (error) {
            console.error(`Erro ao mudar apelido de ${member.user.tag}:`, error);
        }
    }
}

import { createEvent } from "#base";
import { EmbedBuilder, AuditLogEvent } from "discord.js";
import constants from "../../../constants.json" with { type: "json" };
export default createEvent({
    name: "Member Ban Log",
    event: "guildBanAdd",
    async run(ban) {
        const { guild, user } = ban;
        const banChannelId = constants.ban.channelId;
        if (banChannelId && banChannelId !== "INSERIR_ID_DO_CANAL_DE_BAN") {
            const channel = guild.channels.cache.get(banChannelId) || await guild.channels.fetch(banChannelId).catch(() => null);
            if (channel && channel.isTextBased()) {
                // Tenta buscar o motivo e quem baniu no log de auditoria
                let reason = ban.reason || "Não informado";
                let executor = "Desconhecido";
                const fetchedLogs = await guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MemberBanAdd,
                }).catch(() => null);
                const banLog = fetchedLogs?.entries.first();
                if (banLog && banLog.target?.id === user.id) {
                    executor = banLog.executor ? banLog.executor.toString() : "Desconhecido";
                    reason = banLog.reason || reason;
                }
                const embed = new EmbedBuilder()
                    .setTitle("🔨 Membro Banido")
                    .setDescription(`${user} (**${user.tag}**) foi banido da facção.\n\n**ID:** \`${user.id}\`\n**Motivo:** ${reason}\n**Responsável:** ${executor}`)
                    .setColor(0x2b2d31) // Minimalista (fundo do Discord)
                    .setThumbnail(user.displayAvatarURL({ size: 512 }))
                    .setTimestamp();
                await channel.send({
                    embeds: [embed]
                }).catch((err) => {
                    console.error(`Erro ao enviar mensagem de banimento de ${user.tag}:`, err);
                });
            }
        }
    }
});

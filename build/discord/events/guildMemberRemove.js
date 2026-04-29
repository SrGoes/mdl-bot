import { createEvent } from "#base";
import { EmbedBuilder } from "discord.js";
import constants from "../../../constants.json" with { type: "json" };
export default createEvent({
    name: "Member Remove Log",
    event: "guildMemberRemove",
    async run(member) {
        const { guild } = member;
        const leaveChannelId = constants.leave.channelId;
        if (leaveChannelId && leaveChannelId !== "INSERIR_ID_DO_CANAL_DE_SAIDA") {
            const channel = guild.channels.cache.get(leaveChannelId) || await guild.channels.fetch(leaveChannelId).catch(() => null);
            if (channel && channel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle("🚪 Saída de Membro")
                    .setDescription(`${member.user} (**${member.user.tag}**) saiu do servidor.\n\nAtualmente restam **${guild.memberCount}** membros na facção.`)
                    .setColor(0x2b2d31) // Minimalista (fundo do Discord)
                    .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
                    .setTimestamp();
                await channel.send({
                    embeds: [embed]
                }).catch((err) => {
                    console.error(`Erro ao enviar mensagem de saída de ${member.user.tag}:`, err);
                });
            }
        }
    }
});

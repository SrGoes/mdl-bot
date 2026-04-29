import { createEvent } from "#base";
import { EmbedBuilder } from "discord.js";
import constants from "../../../constants.json" with { type: "json" };
export default createEvent({
    name: "Member Add Setup",
    event: "guildMemberAdd",
    async run(member) {
        if (member.user.bot)
            return;
        const { guild } = member;
        // 1. Adiciona o cargo inicial
        const initialRoleId = constants.roleRequest.initialRoleId;
        if (initialRoleId && initialRoleId !== "INSERIR_ID_DO_CARGO_INICIAL") {
            // Tenta achar o cargo no cache ou busca na API
            const role = guild.roles.cache.get(initialRoleId) || await guild.roles.fetch(initialRoleId).catch(() => null);
            if (role) {
                await member.roles.add(role).catch((err) => {
                    console.error(`Erro ao adicionar cargo inicial no membro ${member.user.tag}:`, err);
                });
            }
            else {
                console.warn(`Cargo inicial com ID ${initialRoleId} não encontrado no servidor.`);
            }
        }
        // 2. Envia embed no canal de boas-vindas
        const welcomeChannelId = constants.welcome.channelId;
        if (welcomeChannelId && welcomeChannelId !== "INSERIR_ID_DO_CANAL_DE_BOAS_VINDAS") {
            const channel = guild.channels.cache.get(welcomeChannelId) || await guild.channels.fetch(welcomeChannelId).catch(() => null);
            if (channel && channel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle("👋 Bem-vindo(a) à facção!")
                    .setDescription(`Olá ${member.user}, seja muito bem-vindo(a) ao **${guild.name}**!\n\nVocê acaba de receber seu cargo inicial. Para ter acesso completo, vá até o canal de solicitações e faça o seu registro preenchendo o formulário.`)
                    .setColor(0x2b2d31) // Minimalista (fundo do Discord)
                    .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
                    .setFooter({ text: `ID do Usuário: ${member.id} • Agora somos ${guild.memberCount} membros!`, iconURL: guild.iconURL() || undefined })
                    .setTimestamp();
                await channel.send({
                    content: `||${member.user}||`,
                    embeds: [embed]
                }).catch((err) => {
                    console.error(`Erro ao enviar mensagem de boas-vindas para ${member.user.tag}:`, err);
                });
            }
            else {
                console.warn(`Canal de boas-vindas com ID ${welcomeChannelId} não encontrado ou não é de texto.`);
            }
        }
    }
});

import { createEvent } from "#base";
import { EmbedBuilder } from "discord.js";
import constants from "../../../constants.json" with { type: "json" };
export default createEvent({
    name: "Hierarchy Auto Updater",
    event: "clientReady",
    async run(client) {
        console.log("Sistema de atualização de Hierarquia iniciado.");
        // Intervalo de 10 minutos (600.000 ms)
        setInterval(async () => {
            await updateHierarchyEmbed(client);
        }, 600000);
        // Executa uma vez ao iniciar
        await updateHierarchyEmbed(client);
    }
});
async function updateHierarchyEmbed(client) {
    const { channelId, roles } = constants.hierarchy;
    if (!channelId || channelId === "INSERIR_ID_DO_CANAL_DA_HIERARQUIA")
        return;
    try {
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel || !channel.isTextBased())
            return;
        const guild = channel.guild;
        const members = await guild.members.fetch();
        const embeds = [];
        let currentEmbed = new EmbedBuilder()
            .setTitle("📊 HIERARQUIA DA FACÇÃO")
            .setColor(0x2b2d31)
            .setThumbnail(guild.iconURL({ size: 512 }));
        let hasAnyMember = false;
        let currentFieldsLength = 0;
        const assignedMemberIds = new Set();
        for (const roleConfig of roles) {
            // Filtra membros que têm o cargo e ainda não foram atribuídos a um cargo superior
            const roleMembers = members
                .filter((m) => m.roles.cache.has(roleConfig.id) && !assignedMemberIds.has(m.id))
                .sort((a, b) => (a.nickname || a.user.username).localeCompare(b.nickname || b.user.username));
            if (roleMembers.size > 0) {
                hasAnyMember = true;
                // Marca os membros como atribuídos
                roleMembers.forEach((m) => assignedMemberIds.add(m.id));
                const memberList = roleMembers.map((m) => `• ${m}`).join("\n");
                const fieldName = `${roleConfig.label}`;
                const fieldValue = memberList;
                // O Discord permite no máximo 25 campos por embed e 6000 caracteres totais.
                // Aqui verificamos se o campo cabe no embed atual
                if (currentEmbed.data.fields && currentEmbed.data.fields.length >= 20 || (currentFieldsLength + fieldValue.length) > 5000) {
                    embeds.push(currentEmbed);
                    currentEmbed = new EmbedBuilder().setColor(0x2b2d31);
                    currentFieldsLength = 0;
                }
                currentEmbed.addFields({ name: fieldName, value: fieldValue, inline: false });
                currentFieldsLength += (fieldName.length + fieldValue.length);
            }
        }
        if (!hasAnyMember) {
            currentEmbed.setDescription("Nenhum membro encontrado nos cargos da hierarquia.");
        }
        // Adiciona o último embed criado à lista
        currentEmbed.setFooter({ text: "Atualizado automaticamente a cada 10 minutos" }).setTimestamp();
        embeds.push(currentEmbed);
        // Gerenciamento de mensagens no canal
        const messages = await channel.messages.fetch({ limit: 50 });
        const botMessages = messages.filter((m) => m.author.id === client.user?.id).reverse(); // Ordem cronológica
        // Converte as mensagens para um array para facilitar o uso de índices
        const botMessagesArray = Array.from(botMessages.values());
        for (let i = 0; i < embeds.length; i++) {
            if (botMessagesArray[i]) {
                await botMessagesArray[i].edit({ embeds: [embeds[i]], components: [] });
            }
            else {
                await channel.send({ embeds: [embeds[i]] });
            }
        }
        // Se houver mais mensagens antigas do bot do que o necessário agora, apaga as excedentes
        if (botMessagesArray.length > embeds.length) {
            for (let i = embeds.length; i < botMessagesArray.length; i++) {
                await botMessagesArray[i].delete().catch(() => null);
            }
        }
    }
    catch (error) {
        console.error("Erro ao atualizar embed de hierarquia:", error);
    }
}

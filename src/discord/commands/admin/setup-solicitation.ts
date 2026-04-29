import { createCommand } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType, TextChannel, PermissionFlagsBits } from "discord.js";
import constants from "../../../../constants.json" with { type: "json" };

createCommand({
    name: "setup-solicitar-cargo",
    description: "Configura a mensagem inicial para solicitação de cargo.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.Administrator, // Restringe o comando a administradores
    async run(interaction) {
        const { guild } = interaction;
        if (!guild) {
            await interaction.reply({ content: "Este comando só pode ser usado em um servidor.", flags: ["Ephemeral"] });
            return;
        }

        const requestChannelId = constants.roleRequest.requestChannelId;
        if (requestChannelId === "INSERIR_ID_DO_CANAL_DE_SOLICITACAO" || !requestChannelId) {
            await interaction.reply({ content: "O ID do canal de solicitação não foi configurado em `constants.json`.", flags: ["Ephemeral"] });
            return;
        }

        const requestChannel = await guild.channels.fetch(requestChannelId);

        if (!requestChannel || requestChannel.type !== ChannelType.GuildText) {
            await interaction.reply({ content: `O canal configurado para solicitações (${requestChannelId}) não foi encontrado ou não é um canal de texto.`, flags: ["Ephemeral"] });
            return;
        }

        const solicitacaoButton = new ButtonBuilder()
            .setCustomId("request_role_button")
            .setLabel("Solicitar Cargo")
            .setStyle(ButtonStyle.Primary);

        const row = createRow(solicitacaoButton);

        await (requestChannel as TextChannel).send({
            embeds: [{
                title: "🎫 SOLICITAR CARGO",
                description: "Clique em Solicitar cargo e preencha o formulário.\n\n📌 **Como funciona**\n1) Envie sua solicitação pelo botão abaixo\n2) A administração analisa e aprova/reprova\n3) Se aprovado: você recebe o cargo e seu apelido é ajustado\n\n📝 **Dados solicitados**\n- Nome\n- Nome do recrutador\n- ID da cidade\n\nℹ️ **Regras**\n- Apenas 1 solicitação pendente por vez\n- Envie informações corretas (evite abreviações)",
                color: 0x2b2d31, // Cor invisível/fundo do Discord para sumir com a listra lateral
                thumbnail: { url: guild.iconURL({ size: 512 }) || "" }, // Use guild icon as thumbnail
                footer: { text: "Sistema de Gerenciamento de Cargos" }
            }],
            components: [row],
        });

        await interaction.reply({ content: `Mensagem de solicitação de cargo enviada para ${requestChannel}.`, flags: ["Ephemeral"] });
    }
});

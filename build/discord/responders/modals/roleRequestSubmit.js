import { createResponder, ResponderType } from "#base";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";
import constants from "../../../../constants.json" with { type: "json" };
import { db } from "#database";
createResponder({
    customId: "role_request_modal",
    types: [ResponderType.ModalComponent],
    async run(interaction) {
        // Log detalhado para debug
        console.log("[DEBUG] Modal submit recebido");
        console.log("[DEBUG] interaction.guild:", interaction.guild?.id);
        console.log("[DEBUG] interaction.user:", interaction.user?.id);
        try {
            if (!interaction.guild) {
                console.log("[DEBUG] interaction.guild ausente");
                await interaction.reply({ content: "Este comando só pode ser usado em um servidor.", flags: ["Ephemeral"] });
                return;
            }
            const realName = interaction.fields.getTextInputValue("real_name_input");
            const characterName = interaction.fields.getTextInputValue("character_name_input");
            const idValue = interaction.fields.getTextInputValue("id_input");
            const recruiter = interaction.fields.getTextInputValue("recruiter_input");
            console.log("[DEBUG] Dados recebidos:", { realName, characterName, idValue, recruiter });
            const approvalChannelId = constants.roleRequest.approvalChannelId;
            if (approvalChannelId === "INSERIR_ID_DO_CANAL_DE_APROVACAO" || !approvalChannelId) {
                console.log("[DEBUG] approvalChannelId inválido:", approvalChannelId);
                await interaction.reply({ content: "O ID do canal de aprovação não foi configurado em `constants.json`. Por favor, contate um administrador.", flags: ["Ephemeral"] });
                return;
            }
            const approvalChannel = await interaction.guild.channels.fetch(approvalChannelId);
            console.log("[DEBUG] approvalChannel:", approvalChannel?.id, approvalChannel?.type);
            if (!approvalChannel || approvalChannel.type !== ChannelType.GuildText) {
                console.log("[DEBUG] approvalChannel não encontrado ou tipo errado");
                await interaction.reply({ content: `O canal configurado para aprovações (${approvalChannelId}) não foi encontrado ou não é um canal de texto. Por favor, contate um administrador.`, flags: ["Ephemeral"] });
                return;
            }
            const registrationId = await db.members.getRegistrationId(interaction.user.id, interaction.guild.id);
            const ticketId = registrationId.toString().padStart(4, '0');
            const createdAt = `<t:${Math.floor(Date.now() / 1000)}:F>`;
            // Verifica se o usuário já tem o cargo de membro para saber se é atualização
            const member = interaction.member;
            const isUpdate = member.roles.cache.has(constants.roleRequest.memberRoleId);
            const title = isUpdate ? "📝 Atualização de cadastro" : "🎫 Pedido de cadastro";
            const description = `Registro: #${ticketId}

✅ **Usuário**
Menção: ${interaction.user}
ID: ${interaction.user.id}

📝 **Dados informados**
Nome: ${realName}
Apelido/vulgo: ${characterName}
Recrutador: ${recruiter || "Não informado"}
ID da cidade: ${idValue}

📊 **Status**
⏳ Pendente...

Criado: ${createdAt}`;
            const requestEmbed = new EmbedBuilder()
                .setColor(constants.colors.default)
                .setTitle(title)
                .setDescription(description)
                .setThumbnail(interaction.user.displayAvatarURL({ size: 512 }));
            const acceptButton = new ButtonBuilder()
                .setCustomId(`approval/accept/${interaction.user.id}`)
                .setLabel("Aceitar")
                .setStyle(ButtonStyle.Success);
            const denyButton = new ButtonBuilder()
                .setCustomId(`approval/deny/${interaction.user.id}`)
                .setLabel("Negar")
                .setStyle(ButtonStyle.Danger);
            const row = createRow(acceptButton, denyButton);
            await approvalChannel.send({
                embeds: [requestEmbed],
                components: [row],
            });
            await interaction.reply({ content: "Sua solicitação de cargo foi enviada para aprovação!", flags: ["Ephemeral"] });
        }
        catch (error) {
            console.error("[DEBUG] Erro ao processar modal de solicitação de cargo:", error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde." }).catch(console.error);
            }
            else {
                await interaction.reply({ content: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.", flags: ["Ephemeral"] }).catch(console.error);
            }
        }
    },
});

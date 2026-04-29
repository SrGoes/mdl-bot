import { createCommand } from "#base";
import { ApplicationCommandType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

createCommand({
    name: "atualizar",
    description: "Abre o formulário para você atualizar seu cadastro (Nome, Vulgo e ID).",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId("role_request_modal")
            .setTitle("Atualização de Cadastro");

        // Create text input for "Nome (do personagem)"
        const realNameInput = new TextInputBuilder()
            .setCustomId("real_name_input")
            .setLabel("Nome (do personagem)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("Ex: Arthur Silva");

        // Create text input for "Apelido/vulgo"
        const characterNameInput = new TextInputBuilder()
            .setCustomId("character_name_input")
            .setLabel("Apelido/vulgo")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("Ex: Kael'thas Sunstrider");

        // Create text input for "ID"
        const idInput = new TextInputBuilder()
            .setCustomId("id_input")
            .setLabel("ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("Ex: 12345");

        // Create text input for "Recrutador"
        const recruiterInput = new TextInputBuilder()
            .setCustomId("recruiter_input")
            .setLabel("Recrutador")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder("Ex: Opcional");

        // Add inputs to action rows
        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(realNameInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(characterNameInput);
        const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);
        const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(recruiterInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    },
});
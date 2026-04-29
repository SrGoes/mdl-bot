import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

createResponder({
    customId: "request_role_button",
    types: [ResponderType.Button],
    async run(interaction) {
        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId("role_request_modal")
            .setTitle("Solicitação de Cargo");

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
            .setPlaceholder("Ex: Arthas Menethil (Opcional)");

        // Add inputs to action rows
        // Each action row can only hold one text input
        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(realNameInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(characterNameInput);
        const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);
        const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(recruiterInput);

        // Add action rows to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    },
});

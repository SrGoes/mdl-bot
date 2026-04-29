import { createResponder, ResponderType } from "#base";

createResponder({
    customId: "modal_test_debug",
    types: [ResponderType.Modal],
    async run(interaction) {
        console.log("[MODALTEST] Modal submit recebido!");
        try {
            const debugValue = interaction.fields.getTextInputValue("debug_input");
            console.log("[MODALTEST] Valor recebido:", debugValue);
            await interaction.reply({ content: `Recebido: ${debugValue}`, flags: ["Ephemeral"] });
        } catch (error) {
            console.error("[MODALTEST] Erro ao processar modal de teste:", error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: "Erro ao processar modal de teste." }).catch(console.error);
            } else {
                await interaction.reply({ content: "Erro ao processar modal de teste.", flags: ["Ephemeral"] }).catch(console.error);
            }
        }
    },
});

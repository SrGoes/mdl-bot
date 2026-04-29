import { createCommand } from "#base";
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { standardizeNickname } from "../../../functions/index.js";

createCommand({
    name: "atualizar-cadastros",
    description: "Sincroniza os apelidos do servidor com o banco de dados e a hierarquia.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    async run(interaction) {
        const { guild } = interaction;
        if (!guild) return;

        await interaction.deferReply({ flags: ["Ephemeral"] });

        try {
            const members = await guild.members.fetch();
            let updatedCount = 0;
            let errorCount = 0;

            for (const [, member] of members) {
                if (member.user.bot) continue;

                // A função de padronização agora busca automaticamente no Banco JSON 
                // e aplica o nome correto (Vulgo | ID) se encontrar.
                try {
                    await standardizeNickname(member);
                    updatedCount++;
                } catch (err) {
                    errorCount++;
                }
            }

            await interaction.editReply({ 
                content: `✅ Varredura concluída!\n\n• Membros processados: ${updatedCount}\n• Erros (provavelmente falta de permissão): ${errorCount}` 
            });

        } catch (error) {
            console.error("Erro ao rodar comando de atualizar cadastros:", error);
            await interaction.editReply({ content: "Ocorreu um erro ao processar a varredura." });
        }
    }
});
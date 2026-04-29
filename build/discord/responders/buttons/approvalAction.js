import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { EmbedBuilder, PermissionsBitField } from "discord.js";
import constants from "../../../../constants.json" with { type: "json" };
import { db } from "#database";
import { z } from "zod";
// Define schema for parsing customId
const approvalSchema = z.object({
    action: z.enum(["accept", "deny"]),
    userId: z.string(),
});
createResponder({
    customId: "approval/:action/:userId", // Usar rota padronizada
    types: [ResponderType.Button],
    parse: approvalSchema.parse,
    async run(interaction, { action, userId }) {
        console.log(`Button clicked! Action: ${action}, UserId: ${userId}`);
        try {
            if (!interaction.guild) {
                await interaction.reply({ content: "Este comando só pode ser usado em um servidor.", flags: ["Ephemeral"] });
                return;
            }
            console.log("Deferring update...");
            await interaction.deferUpdate(); // Defer the button interaction update
            console.log("Update deferred.");
            const { recruiterRoleIds, initialRoleId, memberRoleId } = constants.roleRequest;
            // --- Permission Check ---
            if (!recruiterRoleIds || recruiterRoleIds.length === 0 || recruiterRoleIds.includes("INSERIR_ID_DO_CARGO_DE_RECRUTADOR")) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    await interaction.followUp({ content: "Os IDs dos cargos de recrutador não foram configurados em `constants.json`, e você não é um administrador. Não é possível verificar permissões.", flags: ["Ephemeral"] });
                    return;
                }
            }
            else {
                const member = interaction.member;
                const hasRecruiterRole = recruiterRoleIds.some(roleId => member.roles.cache.has(roleId));
                if (!hasRecruiterRole && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    await interaction.followUp({ content: "Você não tem permissão para aprovar ou negar solicitações de cargo.", flags: ["Ephemeral"] });
                    return;
                }
            }
            console.log("Fetching target member...");
            const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);
            if (!targetMember) {
                console.log("Target member not found.");
                await interaction.followUp({ content: "Não foi possível encontrar o usuário alvo desta solicitação. A solicitação pode ser antiga ou o usuário saiu do servidor.", flags: ["Ephemeral"] });
                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                updatedEmbed.setColor(constants.colors.danger);
                updatedEmbed.setDescription((updatedEmbed.data.description || "") + `\n\n**Status:** Usuário não encontrado ou saiu do servidor.`);
                await interaction.message.edit({ embeds: [updatedEmbed], components: [] });
                return;
            }
            console.log("Target member found, updating roles...");
            const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
            let currentDescription = originalEmbed.data.description || "";
            const decidedAt = `<t:${Math.floor(Date.now() / 1000)}:F>`;
            if (action === "accept") {
                if (initialRoleId && initialRoleId !== "INSERIR_ID_DO_CARGO_INICIAL") {
                    await targetMember.roles.remove(initialRoleId).catch(e => console.error("Error removing initial role:", e));
                }
                if (memberRoleId && memberRoleId !== "INSERIR_ID_DO_CARGO_DE_MEMBRO") {
                    await targetMember.roles.add(memberRoleId).catch(e => console.error("Error adding member role:", e));
                }
                // --- Extract data and Change Nickname ---
                const realNameMatch = currentDescription.match(/Nome:\s*(.+)/);
                const vulgoMatch = currentDescription.match(/Apelido\/vulgo:\s*(.+)/);
                const idMatch = currentDescription.match(/ID da cidade:\s*(\d+)/);
                const recruiterMatch = currentDescription.match(/Recrutador:\s*(.+)/);
                if (vulgoMatch && idMatch) {
                    const vulgo = vulgoMatch[1].trim();
                    const id = idMatch[1].trim();
                    const realName = realNameMatch ? realNameMatch[1].trim() : "Não informado";
                    const recruiter = recruiterMatch ? recruiterMatch[1].trim() : "Não informado";
                    // Salva no Banco de Dados JSON
                    await db.members.upsert(userId, interaction.guild.id, {
                        realName,
                        characterName: vulgo,
                        cityId: id,
                        recruiter: recruiter !== "Não informado" ? recruiter : undefined
                    });
                    const newNickname = `${vulgo} | ${id}`.slice(0, 32); // Discord nickname limit is 32 chars
                    console.log(`Attempting to set nickname to: ${newNickname}`);
                    await targetMember.setNickname(newNickname)
                        .then(() => console.log("Nickname changed successfully."))
                        .catch(e => console.error("Error setting nickname (Permissions/Hierarchy/Owner):", e.message));
                }
                else {
                    console.log("Could not find Vulgo or ID in description.");
                }
                currentDescription = currentDescription.replace("⏳ Pendente...", `✅ APROVADO por ${interaction.user}\nDecidido: ${decidedAt}`);
                originalEmbed
                    .setColor(constants.colors.success)
                    .setDescription(currentDescription);
                console.log("Editing message...");
                await interaction.message.edit({
                    embeds: [originalEmbed],
                    components: [],
                });
                console.log("Message edited, sending followUp...");
                await interaction.followUp({ content: `Solicitação de ${targetMember.user.username} aprovada! Cargos atualizados.`, flags: ["Ephemeral"] });
                console.log("FollowUp sent. Trying to DM user...");
                await targetMember.send(`Sua solicitação de cargo foi aprovada por ${interaction.user.username} no servidor ${interaction.guild.name}!`).catch(() => console.log("User has DMs disabled."));
                console.log("Done accept flow.");
            }
            else if (action === "deny") {
                currentDescription = currentDescription.replace("⏳ Pendente...", `❌ NEGADO por ${interaction.user}\nDecidido: ${decidedAt}`);
                originalEmbed
                    .setColor(constants.colors.danger)
                    .setDescription(currentDescription);
                console.log("Editing message...");
                await interaction.message.edit({
                    embeds: [originalEmbed],
                    components: [],
                });
                console.log("Message edited, sending followUp...");
                await interaction.followUp({ content: `Solicitação de ${targetMember.user.username} negada!`, flags: ["Ephemeral"] });
                console.log("FollowUp sent. Trying to DM user...");
                await targetMember.send(`Sua solicitação de cargo foi negada por ${interaction.user.username} no servidor ${interaction.guild.name}.`).catch(() => console.log("User has DMs disabled."));
                console.log("Done deny flow.");
            }
        }
        catch (error) {
            console.error("Error during approval action:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "Ocorreu um erro interno.", flags: ["Ephemeral"] }).catch(console.error);
            }
            else {
                await interaction.followUp({ content: "Ocorreu um erro interno.", flags: ["Ephemeral"] }).catch(console.error);
            }
        }
    },
});

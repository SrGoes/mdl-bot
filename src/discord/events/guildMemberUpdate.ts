import { createEvent } from "#base";
import { standardizeNickname } from "../../functions/index.js";

export default createEvent({
    name: "Standardize Nickname on Role Change",
    event: "guildMemberUpdate",
    async run(oldMember, newMember) {
        // Verifica se os cargos mudaram
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        if (oldRoles.size !== newRoles.size || !oldRoles.every(role => newRoles.has(role.id))) {
            await standardizeNickname(newMember);
        }
    }
});
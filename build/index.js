import { env } from "#env";
import { bootstrap } from "@constatic/base";
await bootstrap({ meta: import.meta, env });
// Importa o responder da modal de atualização de cadastro após o bootstrap
import "./discord/responders/modals/modalTestDebug";
import "./discord/responders/modals/roleRequestSubmit";

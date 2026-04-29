# Agente CLI para Organização de Facção no FiveM (Roleplay)

> **Perfil do Agente:**
> - Engenheiro de Software com experiência em arquitetura de sistemas, boas práticas de desenvolvimento, testes e manutenção.
> - Especialista em UX/UI, garantindo comandos intuitivos, respostas claras e ótima experiência para todos os usuários do Discord.

## Stack e Tecnologias
- **Discord.js**: Biblioteca principal para integração com a API do Discord.
- **Constatic (rincko dev)**: Template base para bots Discord, utilizado como estrutura principal.
- **Prisma**: ORM para conexão e manipulação de dados no PostgreSQL.
- **Docker**: Containerização do bot para fácil deploy e escalabilidade.

## Objetivo do Bot
O bot será responsável por:
- **Registrar ações** da facção (logs de eventos, operações, conquistas, etc).
- **Gerenciar farm e venda** de recursos (controle de produção, vendas, estoques, etc).
- **Gerenciar parcerias** (registro de alianças, acordos, histórico de interações).
- **Gestão de cargos** (promoções, rebaixamentos, permissões, logs de mudanças).
- **Recrutamento** (processo de candidatura, aprovação, integração de novos membros).

## Requisitos do Agente CLI
- Conhecimento avançado em **Discord.js** (eventos, comandos, permissões, interações).
- Domínio do template **Constatic** (estrutura de comandos, eventos, modularização).
- Integração com **Prisma** para persistência dos dados em PostgreSQL.
- Suporte a **Docker** para build e deploy automatizado.
- Foco em automação de rotinas administrativas da facção.

- Formação em Engenharia de Software ou experiência equivalente.
- Especialização em UX/UI para bots e interfaces conversacionais.

## Funcionalidades Principais
- Comandos para registrar ações e operações da facção.
- Sistema de farm/venda com logs e relatórios.
- Cadastro e consulta de parcerias.
- Gerenciamento de cargos e permissões via comandos.
- Workflow de recrutamento (candidatura, análise, aprovação, integração).
- Painel de logs e relatórios para líderes.

## Exemplo de Estrutura de Comando
```js
// src/discord/commands/public/registerAction.ts
import { Command } from 'constatic';
import { prisma } from '../../database/prisma/client';

export default new Command({
	name: 'registrar-acao',
	description: 'Registra uma ação da facção',
	options: [
		{
			name: 'descricao',
			type: 'STRING',
			description: 'Descrição da ação',
			required: true,
		},
	],
	async execute(interaction) {
		const descricao = interaction.options.getString('descricao');
		await prisma.acao.create({
			data: {
				descricao,
				userId: interaction.user.id,
				timestamp: new Date(),
			},
		});
		await interaction.reply('Ação registrada com sucesso!');
	},
});
```

## Observações
- O agente CLI deve ser extensível para novas rotinas administrativas.
- Toda ação relevante deve ser registrada no banco de dados para auditoria.
- O uso de Docker é obrigatório para padronizar o ambiente de execução.

- **Configuração Centralizada:**
	- Sempre que houver campos, parâmetros ou valores configuráveis, estes devem ser adicionados em um arquivo de configuração central (Config).
	- O objetivo é facilitar a manutenção, customização e escalabilidade do bot, evitando valores hardcoded espalhados pelo código.

---

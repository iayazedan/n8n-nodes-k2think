import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

export class K2Think implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'K2 Think',
		name: 'k2Think',
		icon: 'file:k2think.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ "Chat: " + $parameter["model"] }}',
		description: 'Call the K2 Think V2 reasoning model (MBZUAI-IFM)',
		defaults: {
			name: 'K2 Think',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'k2ThinkApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'MBZUAI-IFM/K2-Think-v2',
				required: true,
				description: 'The model ID to send to the gateway',
			},
			{
				displayName: 'System Prompt',
				name: 'systemPrompt',
				type: 'string',
				typeOptions: { rows: 2 },
				default: '',
				description: 'Optional system message prepended to the conversation',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'The user message to send to K2 Think',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Full API Response',
						name: 'includeRaw',
						type: 'boolean',
						default: false,
						description: 'Whether to also include the raw API response under "raw"',
					},
					{
						displayName: 'Max Completion Tokens',
						name: 'maxCompletionTokens',
						type: 'number',
						typeOptions: { minValue: 1 },
						default: 1024,
						description:
							'Max tokens for the answer. The K2 gateway uses max_completion_tokens (not max_tokens). Headroom is added automatically for the reasoning preamble.',
					},
					{
						displayName: 'Put Output In Field',
						name: 'outputField',
						type: 'string',
						default: 'response',
						description: 'Name of the field to place the model response in',
					},
					{
						displayName: 'Reasoning Headroom',
						name: 'reasoningHeadroom',
						type: 'number',
						typeOptions: { minValue: 0 },
						default: 3500,
						description: 'Extra tokens added on top of Max Completion Tokens so the long &lt;think&gt; preamble does not truncate the answer',
					},
					{
						displayName: 'Strip Think Reasoning',
						name: 'stripThinking',
						type: 'boolean',
						default: true,
						description: 'Whether to remove the &lt;think&gt;...&lt;/think&gt; reasoning preamble from the output, keeping only the final answer',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 2 },
						default: 0.7,
						description: 'Sampling temperature (0 = deterministic)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const model = this.getNodeParameter('model', i) as string;
				const systemPrompt = this.getNodeParameter('systemPrompt', i, '') as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const options = this.getNodeParameter('options', i, {}) as {
					temperature?: number;
					maxCompletionTokens?: number;
					reasoningHeadroom?: number;
					stripThinking?: boolean;
					outputField?: string;
					includeRaw?: boolean;
				};

				if (!prompt) {
					throw new NodeOperationError(this.getNode(), 'Prompt is empty', {
						itemIndex: i,
					});
				}

				const credentials = await this.getCredentials('k2ThinkApi');
				const baseUrl = ((credentials.baseUrl as string) || 'https://api.k2think.ai/v1').replace(
					/\/+$/,
					'',
				);

				const messages: Array<{ role: string; content: string }> = [];
				if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
				messages.push({ role: 'user', content: prompt });

				const maxCompletionTokens =
					(options.maxCompletionTokens ?? 1024) + (options.reasoningHeadroom ?? 3500);

				// K2 gateway quirks: max_completion_tokens (not max_tokens), no streaming,
				// no response_format JSON mode.
				const body = {
					model,
					messages,
					temperature: options.temperature ?? 0.7,
					max_completion_tokens: maxCompletionTokens,
					stream: false,
				};

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'k2ThinkApi',
					{
						method: 'POST',
						url: `${baseUrl}/chat/completions`,
						body,
						json: true,
					},
				)) as {
					choices?: Array<{ message?: { content?: string } }>;
				};

				let content = response.choices?.[0]?.message?.content ?? '';

				// Strip the <think>...</think> reasoning preamble unless disabled.
				if (options.stripThinking !== false) {
					content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
				}

				const outputField = options.outputField || 'response';
				const json: IDataObject = { [outputField]: content };
				if (options.includeRaw) json.raw = response as IDataObject;

				returnData.push({ json, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				if (error instanceof NodeOperationError) throw error;
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}

import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class K2ThinkApi implements ICredentialType {
	name = 'k2ThinkApi';

	displayName = 'K2 Think API';

	documentationUrl = 'https://ifm.ai/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your K2 Think (api.k2think.ai) API key',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.k2think.ai/v1',
			description: 'The OpenAI-compatible base URL for the K2 Think gateway',
		},
	];

	// Sends the key as a Bearer token on every request the node makes.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Lets users hit "Test" in the credential dialog. GET /models is the
	// standard OpenAI-compatible health check.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/models',
			method: 'GET',
		},
	};
}

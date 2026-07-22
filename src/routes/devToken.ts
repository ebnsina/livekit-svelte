/**
 * Generate a LiveKit access token (HS256 JWT) entirely in the browser using the
 * Web Crypto API. Nothing is sent over the network — the API secret never leaves
 * this page.
 *
 * This is a convenience for the demo / local testing ONLY. In a real app you must
 * mint tokens on a server so your API secret is never exposed to the client.
 */
export interface DevTokenOptions {
	apiKey: string;
	apiSecret: string;
	identity: string;
	room: string;
	name?: string;
	/** Token lifetime in seconds. Defaults to 6 hours. */
	ttlSeconds?: number;
}

function base64url(input: ArrayBuffer | string): string {
	const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generateDevToken(opts: DevTokenOptions): Promise<string> {
	if (!opts.apiKey || !opts.apiSecret) throw new Error('API key and secret are required');
	if (!opts.identity) throw new Error('An identity is required');

	const now = Math.floor(Date.now() / 1000);
	const header = { alg: 'HS256', typ: 'JWT' };
	const payload = {
		exp: now + (opts.ttlSeconds ?? 6 * 60 * 60),
		iss: opts.apiKey,
		nbf: now,
		sub: opts.identity,
		...(opts.name ? { name: opts.name } : {}),
		// LiveKit VideoGrant lives under the `video` claim.
		video: {
			room: opts.room,
			roomJoin: true,
			canPublish: true,
			canSubscribe: true,
			canPublishData: true
		}
	};

	const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(opts.apiSecret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
	return `${data}.${base64url(signature)}`;
}

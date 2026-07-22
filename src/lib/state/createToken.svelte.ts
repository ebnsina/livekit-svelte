import { log } from '@livekit/components-core';

/** Identity, name, and metadata used when requesting a token. */
export interface UserInfo {
	identity?: string;
	name?: string;
	metadata?: string;
}

/** Options for {@link createToken}. */
export interface CreateTokenOptions {
	userInfo?: UserInfo;
}

/**
 * Reactively fetches a token from the given token endpoint with the given user info.
 *
 * The fetch runs browser-side only and re-runs when the endpoint, room name, or user info change.
 *
 * @param tokenEndpoint - the URL of the token endpoint.
 * @param roomName - the room to request a token for.
 * @param options - the user info to include in the request.
 * @returns a reactive holder whose `.current` is the fetched access token (or `undefined`).
 */
export function createToken(
	tokenEndpoint: string | undefined,
	roomName: string,
	options: CreateTokenOptions = {}
): { readonly current: string | undefined } {
	let token = $state<string | undefined>(undefined);

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (tokenEndpoint === undefined) {
			throw Error('token endpoint needs to be defined');
		}
		if (options.userInfo?.identity === undefined) {
			return;
		}
		const tokenFetcher = async () => {
			log.debug('fetching token');
			const params = new URLSearchParams();
			if (options.userInfo?.identity) params.set('identity', options.userInfo.identity);
			if (options.userInfo?.name) params.set('name', options.userInfo.name);
			if (options.userInfo?.metadata) params.set('metadata', options.userInfo.metadata);
			params.set('roomName', roomName);
			const res = await fetch(`${tokenEndpoint}?${params.toString()}`);
			if (!res.ok) {
				log.error(
					`Could not fetch token. Server responded with status ${res.status}: ${res.statusText}`
				);
				return;
			}
			const { accessToken } = await res.json();
			token = accessToken;
		};
		tokenFetcher();
	});

	return {
		get current() {
			return token;
		}
	};
}

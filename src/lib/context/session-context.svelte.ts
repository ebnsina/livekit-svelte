import { getContext, setContext } from 'svelte';
import type { UseSessionReturn } from '../state/createSession.svelte.js';

const SESSION_CONTEXT_KEY = Symbol('lk-session');

/** Provide a session to descendant components. Call during component init. */
export function setSessionContext(session: UseSessionReturn): UseSessionReturn {
	setContext(SESSION_CONTEXT_KEY, session);
	return session;
}

/** Get the session from context, or `undefined` if none was provided. */
export function getMaybeSessionContext(): UseSessionReturn | undefined {
	return getContext<UseSessionReturn | undefined>(SESSION_CONTEXT_KEY);
}

/**
 * Get the session from context, throwing if it is missing.
 * Use inside components that must live within a `<SessionProvider>`.
 */
export function getSessionContext(): UseSessionReturn {
	const session = getMaybeSessionContext();
	if (!session) {
		throw new Error(
			'[livekit-svelte] tried to access session context outside of a <SessionProvider> component'
		);
	}
	return session;
}

/**
 * Resolve a session either from an explicit argument or from context.
 * Useful for factories/components that accept an optional `session`.
 */
export function ensureSession(session?: UseSessionReturn): UseSessionReturn {
	const s = session ?? getMaybeSessionContext();
	if (!s) {
		throw new Error(
			'No session provided, make sure you are inside a Session context or pass the session explicitly'
		);
	}
	return s;
}

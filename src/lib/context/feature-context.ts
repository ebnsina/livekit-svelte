import { getContext, setContext } from 'svelte';

/** Feature flags provided to the component tree. */
export interface FeatureFlags {
	autoSubscription?: boolean;
}

const FEATURE_CONTEXT_KEY = Symbol('lk-feature');

/** Provide feature flags to descendants. Call during init. */
export function setFeatureContext(flags: FeatureFlags): FeatureFlags {
	setContext(FEATURE_CONTEXT_KEY, flags);
	return flags;
}

/** Get feature flags from context, or `undefined` if none were provided. */
export function getFeatureContext(): FeatureFlags | undefined {
	return getContext<FeatureFlags | undefined>(FEATURE_CONTEXT_KEY);
}

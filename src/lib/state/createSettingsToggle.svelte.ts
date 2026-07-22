import { getLayoutContext } from '../context/layout-context.svelte.js';

/** Reactive state for a settings-menu toggle button. */
export interface SettingsToggleState {
	readonly className: string;
	readonly pressed: boolean;
	/** Toggle the settings menu widget. */
	toggle: () => void;
}

/**
 * Provides the state for a button that toggles the settings menu widget.
 * Must be used within a layout context.
 */
export function createSettingsToggle(): SettingsToggleState {
	const widget = getLayoutContext().widget;
	const className = 'lk-button lk-settings-toggle';

	return {
		className,
		get pressed() {
			return !!widget.state?.showSettings;
		},
		toggle: () => widget.dispatch?.({ msg: 'toggle_settings' })
	};
}

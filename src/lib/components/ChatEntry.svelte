<script module lang="ts">
	import { createDefaultGrammar, tokenize } from '@livekit/components-core';

	/**
	 * A formatter for a chat message body. Receives the raw message string and
	 * returns an HTML string that is rendered into the message body. Any text
	 * that is not part of a produced element must be HTML-escaped by the formatter.
	 */
	export type MessageFormatter = (message: string) => string;

	function escapeHtml(value: string): string {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	/**
	 * Detects URLs and email addresses in a chat message and turns them into
	 * anchor tags. Ports `formatChatMessageLinks` from `@livekit/components-react`,
	 * reusing the core `tokenize` / `createDefaultGrammar` helpers. Returns an
	 * HTML string with all plain text safely escaped.
	 */
	export function formatChatMessageLinks(message: string): string {
		return tokenize(message, createDefaultGrammar())
			.map((tok) => {
				if (typeof tok === 'string') {
					return escapeHtml(tok);
				}
				const content = tok.content.toString();
				const href =
					tok.type === 'url'
						? /^http(s?):\/\//.test(content)
							? content
							: `https://${content}`
						: `mailto:${content}`;
				return `<a class="lk-chat-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(content)}</a>`;
			})
			.join('');
	}
</script>

<script lang="ts">
	import type { ReceivedChatMessage } from '@livekit/components-core';
	import type { HTMLLiAttributes } from 'svelte/elements';

	interface Props extends HTMLLiAttributes {
		/** The chat message object to display. */
		entry: ReceivedChatMessage;
		/** Hide the sender name (e.g. for consecutive messages from the same person). */
		hideName?: boolean;
		/** Hide the message timestamp. */
		hideTimestamp?: boolean;
		/** An optional formatter for the message body. */
		messageFormatter?: MessageFormatter;
	}

	let {
		entry,
		hideName = false,
		hideTimestamp = false,
		messageFormatter,
		class: className,
		...rest
	}: Props = $props();

	const formattedMessage = $derived(messageFormatter ? messageFormatter(entry.message) : undefined);
	const hasBeenEdited = $derived(!!entry.editTimestamp);
	const time = $derived(new Date(entry.timestamp));
	const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
	const name = $derived(entry.from?.name ?? entry.from?.identity);
	const imageFiles = $derived(
		(entry.attachedFiles ?? []).filter((file) => file.type.startsWith('image/'))
	);

	function objectUrl(file: File): string {
		return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
			? URL.createObjectURL(file)
			: '';
	}
</script>

<li
	class={['lk-chat-entry', className]}
	title={time.toLocaleTimeString(locale, { timeStyle: 'full' })}
	data-lk-message-origin={entry.from?.isLocal ? 'local' : 'remote'}
	{...rest}
>
	{#if !hideTimestamp || !hideName || hasBeenEdited}
		<span class="lk-meta-data">
			{#if !hideName}<strong class="lk-participant-name">{name}</strong>{/if}
			{#if !hideTimestamp || hasBeenEdited}
				<span class="lk-timestamp">
					{#if hasBeenEdited}edited {/if}{time.toLocaleTimeString(locale, { timeStyle: 'short' })}
				</span>
			{/if}
		</span>
	{/if}

	<span class="lk-message-body">
		{#if formattedMessage !== undefined}{@html formattedMessage}{:else}{entry.message}{/if}
	</span>
	<span class="lk-message-attachements">
		{#each imageFiles as file (file.name)}
			<img style="max-width: 300px; max-height: 300px;" src={objectUrl(file)} alt={file.name} />
		{/each}
	</span>
</li>

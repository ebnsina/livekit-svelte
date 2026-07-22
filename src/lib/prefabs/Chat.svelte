<script lang="ts">
	import type {
		ChatOptions,
		MessageDecoder,
		MessageEncoder,
		ReceivedChatMessage
	} from '@livekit/components-core';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMaybeLayoutContext } from '../context/layout-context.svelte.js';
	import ChatEntry, { type MessageFormatter } from '../components/ChatEntry.svelte';
	import ChatToggle from '../components/ChatToggle.svelte';
	import { createChat } from '../state/createChat.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>, ChatOptions {
		messageEncoder?: MessageEncoder;
		messageDecoder?: MessageDecoder;
		channelTopic?: string;
		/** An optional formatter for message bodies. */
		messageFormatter?: MessageFormatter;
		/** Optional custom rendering for each message; receives the message entry. */
		children?: Snippet<[{ entry: ReceivedChatMessage; messageFormatter?: MessageFormatter }]>;
	}

	let {
		messageFormatter,
		messageDecoder,
		messageEncoder,
		channelTopic,
		children,
		class: className,
		...rest
	}: Props = $props();

	const chat = createChat(() => ({ messageDecoder, messageEncoder, channelTopic }));

	const layoutContext = getMaybeLayoutContext();

	let ulRef = $state<HTMLUListElement>();
	let inputValue = $state('');
	let lastReadMsgAt = 0;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const value = inputValue.trim();
		if (value !== '') {
			await chat.send(value);
			inputValue = '';
		}
	}

	// Keep the message list scrolled to the bottom as messages arrive.
	$effect(() => {
		void chat.chatMessages;
		if (ulRef) ulRef.scrollTo({ top: ulRef.scrollHeight });
	});

	// Track unread messages on the layout context's widget state.
	$effect(() => {
		const messages = chat.chatMessages;
		if (!layoutContext || messages.length === 0) return;

		const widget = layoutContext.widget;
		if (
			widget.state?.showChat &&
			messages.length > 0 &&
			lastReadMsgAt !== messages[messages.length - 1]?.timestamp
		) {
			lastReadMsgAt = messages[messages.length - 1]?.timestamp;
			return;
		}

		const unreadMessageCount = messages.filter(
			(msg) => !lastReadMsgAt || msg.timestamp > lastReadMsgAt
		).length;

		if (unreadMessageCount > 0 && widget.state?.unreadMessages !== unreadMessageCount) {
			widget.dispatch?.({ msg: 'unread_msg', count: unreadMessageCount });
		}
	});
</script>

<div class={['lk-chat', className]} {...rest}>
	<div class="lk-chat-header">
		Messages
		{#if layoutContext}
			<ChatToggle class="lk-close-button">
				<X />
			</ChatToggle>
		{/if}
	</div>

	<ul bind:this={ulRef} class="lk-list lk-chat-messages">
		{#each chat.chatMessages as msg, idx (msg.id ?? idx)}
			{#if children}
				{@render children({ entry: msg, messageFormatter })}
			{:else}
				{@const prev = chat.chatMessages[idx - 1]}
				{@const hideName = idx >= 1 && prev.from === msg.from}
				{@const hideTimestamp = idx >= 1 && msg.timestamp - prev.timestamp < 60_000}
				<ChatEntry
					{hideName}
					hideTimestamp={hideName === false ? false : hideTimestamp}
					entry={msg}
					{messageFormatter}
				/>
			{/if}
		{/each}
	</ul>

	<form class="lk-chat-form" onsubmit={handleSubmit}>
		<input
			class="lk-form-control lk-chat-form-input"
			disabled={chat.isSending}
			bind:value={inputValue}
			type="text"
			placeholder="Enter a message..."
			oninput={(ev) => ev.stopPropagation()}
			onkeydown={(ev) => ev.stopPropagation()}
			onkeyup={(ev) => ev.stopPropagation()}
		/>
		<button type="submit" class="lk-button lk-chat-form-button" disabled={chat.isSending}>
			Send
		</button>
	</form>
</div>

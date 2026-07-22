/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	RpcError,
	isSerializer,
	serializers,
	type PerformRpcParams,
	type RpcInvocationData,
	type Serializer,
	type SerializerInput,
	type SerializerOutput
} from 'livekit-client';
import { ensureSession } from '../context/session-context.svelte.js';
import { isUseSessionReturn, type UseSessionReturn } from './createSession.svelte.js';

/** An RPC handler invoked when a registered method is called. */
export type RpcHandler<Input = any, Output = any> = (
	payload: Input,
	data: RpcInvocationData
) => Promise<Output>;

/** RPC call parameters with an arbitrary (serializable) payload. */
export type RpcCallParams<Payload> = Omit<PerformRpcParams, 'payload'> & { payload: Payload };

/** Options for {@link createRpc}. */
export type CreateRpcOptions<S extends Serializer<any, any> = Serializer<any, any>> = {
	/** Only accept RPCs from this participant. Others receive UNSUPPORTED_METHOD. */
	fromIdentity?: string;
	/** Serializer applied to the handler's in/out data. Defaults to `serializers.json()`. */
	serializer?: S;
};

/** The outbound RPC calling function returned by {@link createRpc}. */
export type RpcPerformFn = {
	<Output = string, Input = unknown>(
		params: RpcCallParams<Input>,
		serializer: Serializer<Output, Input>
	): Promise<Output>;
	(params: PerformRpcParams): Promise<string>;
};

/** The reactive shape returned by {@link createRpc}. */
export type RpcState = {
	perform: RpcPerformFn;
};

/**
 * Declarative RPC method registration and outbound RPC calls.
 *
 * Port of React's `useRpc`. Registers a handler for an incoming RPC method (in an
 * effect, unregistering on teardown) and returns a `perform` function for outbound calls.
 */
export function createRpc<S extends Serializer<any, any>>(
	session: UseSessionReturn,
	methodName: string,
	handler: RpcHandler<SerializerInput<S>, SerializerOutput<S>>,
	options?: CreateRpcOptions<S>
): RpcState;
export function createRpc<S extends Serializer<any, any>>(
	methodName: string,
	handler: RpcHandler<SerializerInput<S>, SerializerOutput<S>>,
	options?: CreateRpcOptions<S>
): RpcState;
export function createRpc(session: UseSessionReturn): RpcState;
export function createRpc(): RpcState;
export function createRpc(
	methodNameOrSession?: string | UseSessionReturn,
	handlerOrMethodName?: RpcHandler<any, any> | string,
	optionsOrHandler?: CreateRpcOptions<Serializer<any, any>> | RpcHandler<any, any>,
	maybeOptions?: CreateRpcOptions<Serializer<any, any>>
): RpcState {
	let session: UseSessionReturn | undefined;
	let methodName: string | undefined;
	let handler: RpcHandler<any, any> | undefined;
	let options: CreateRpcOptions<Serializer<any, any>> | undefined;

	if (isUseSessionReturn(methodNameOrSession)) {
		session = methodNameOrSession;
		methodName = handlerOrMethodName as string;
		handler = optionsOrHandler as RpcHandler<any, any>;
		options = maybeOptions;
	} else {
		methodName = methodNameOrSession;
		handler = handlerOrMethodName as RpcHandler<any, any>;
		options = optionsOrHandler as CreateRpcOptions<any>;
	}

	const { room } = ensureSession(session);

	$effect(() => {
		if (!methodName) {
			return;
		}
		const method = methodName;

		room.registerRpcMethod(method, async (data: RpcInvocationData) => {
			const fromIdentity = options?.fromIdentity;
			if (fromIdentity && data.callerIdentity !== fromIdentity) {
				throw RpcError.builtIn(
					'UNSUPPORTED_METHOD',
					`Method not available for caller ${data.callerIdentity}`
				);
			}

			if (!handler) {
				throw RpcError.builtIn('APPLICATION_ERROR', `No handler registered for method "${method}"`);
			}

			const serializer = options?.serializer ?? serializers.json();

			let parsed;
			try {
				parsed = serializer.parse(data.payload);
			} catch (e) {
				throw RpcError.builtIn('APPLICATION_ERROR', `Failed to parse RPC payload: ${e}`);
			}

			const result = await handler(parsed, data);

			try {
				return serializer.serialize(result);
			} catch (e) {
				throw RpcError.builtIn('APPLICATION_ERROR', `Failed to serialize RPC response: ${e}`);
			}
		});

		return () => {
			room.unregisterRpcMethod(method);
		};
	});

	const perform = (async (
		params: RpcCallParams<unknown>,
		serializer: Serializer<any, any> = serializers.json()
	) => {
		if (isSerializer(serializer)) {
			let serialized: string;
			try {
				serialized = serializer.serialize(params.payload);
			} catch (e) {
				throw RpcError.builtIn('APPLICATION_ERROR', `Failed to serialize RPC payload: ${e}`);
			}
			const rawResponse = await room.localParticipant.performRpc({
				destinationIdentity: params.destinationIdentity,
				method: params.method,
				payload: serialized,
				responseTimeout: params.responseTimeout
			});
			try {
				return serializer.parse(rawResponse);
			} catch (e) {
				throw RpcError.builtIn('APPLICATION_ERROR', `Failed to parse RPC response: ${e}`);
			}
		}
		return room.localParticipant.performRpc(params as PerformRpcParams);
	}) as RpcPerformFn;

	return { perform };
}

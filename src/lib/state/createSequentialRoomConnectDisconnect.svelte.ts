import { Mutex, type Room } from 'livekit-client';
import { log } from '@livekit/components-core';

const CONNECT_DISCONNECT_WARNING_THRESHOLD_QUANTITY = 2;
const CONNECT_DISCONNECT_WARNING_THRESHOLD_MS = 400;

const ROOM_CHANGE_WARNING_THRESHOLD_QUANTITY = 3;
const ROOM_CHANGE_WARNING_THRESHOLD_MS = 1000;

type ConnectFn = typeof Room.prototype.connect;
type DisconnectFn = typeof Room.prototype.disconnect;

/** Result of {@link createSequentialRoomConnectDisconnect}. */
export interface SequentialRoomConnectDisconnectState {
	/** Enqueue a sequentialized `room.connect(...)`, or `null` when no room is set. */
	readonly connect: ConnectFn | null;
	/** Enqueue a sequentialized `room.disconnect(...)`, or `null` when no room is set. */
	readonly disconnect: DisconnectFn | null;
}

type QueueItem =
	| {
			type: 'connect';
			room: Room;
			args: Parameters<ConnectFn>;
			resolve: (value: Awaited<ReturnType<ConnectFn>>) => void;
			reject: (err: Error) => void;
	  }
	| {
			type: 'disconnect';
			room: Room;
			args: Parameters<DisconnectFn>;
			resolve: (value: Awaited<ReturnType<DisconnectFn>>) => void;
			reject: (err: Error) => void;
	  };

/**
 * Sequentializes `room.connect(...)` and `room.disconnect(...)` calls so they never
 * overlap (e.g. a connect starting while a cleanup disconnect is still running).
 *
 * Port of React's `useSequentialRoomConnectDisconnect`. The room is passed as an
 * accessor; when it changes, the pending queue is cleared.
 *
 * @param getRoom - accessor for the room (or `undefined`).
 */
export function createSequentialRoomConnectDisconnect<R extends Room | undefined>(
	getRoom: () => R
): SequentialRoomConnectDisconnectState {
	let connectDisconnectQueue: QueueItem[] = [];

	const processConnectsAndDisconnectsLock = new Mutex();
	const processConnectsAndDisconnects = async () => {
		return processConnectsAndDisconnectsLock.lock().then(async (unlock) => {
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const message = connectDisconnectQueue.pop();
				if (!message) {
					unlock();
					break;
				}

				switch (message.type) {
					case 'connect':
						await message.room
							.connect(...message.args)
							.then(message.resolve)
							.catch(message.reject);
						break;
					case 'disconnect':
						await message.room
							.disconnect(...message.args)
							.then(message.resolve)
							.catch(message.reject);
						break;
				}
			}
		});
	};

	let roomChangedTimes: Date[] = [];
	const checkRoomThreshold = (now: Date) => {
		let roomChangesInThreshold = 0;
		roomChangedTimes = roomChangedTimes.filter((i) => {
			const isWithinThreshold = now.getTime() - i.getTime() < ROOM_CHANGE_WARNING_THRESHOLD_MS;
			if (isWithinThreshold) {
				roomChangesInThreshold += 1;
			}
			return isWithinThreshold;
		});

		if (roomChangesInThreshold > ROOM_CHANGE_WARNING_THRESHOLD_QUANTITY) {
			log.warn(
				`createSequentialRoomConnectDisconnect: room changed reference rapidly (over ${ROOM_CHANGE_WARNING_THRESHOLD_QUANTITY}x in ${ROOM_CHANGE_WARNING_THRESHOLD_MS}ms). This is not recommended.`
			);
		}
	};

	// When the room changes, clear any pending connect / disconnect calls and log when it happened.
	$effect(() => {
		void getRoom();
		connectDisconnectQueue = [];

		const now = new Date();
		roomChangedTimes.push(now);
		checkRoomThreshold(now);
	});

	let connectDisconnectEnqueueTimes: Date[] = [];
	const checkConnectDisconnectThreshold = (now: Date) => {
		let connectDisconnectsInThreshold = 0;
		connectDisconnectEnqueueTimes = connectDisconnectEnqueueTimes.filter((i) => {
			const isWithinThreshold =
				now.getTime() - i.getTime() < CONNECT_DISCONNECT_WARNING_THRESHOLD_MS;
			if (isWithinThreshold) {
				connectDisconnectsInThreshold += 1;
			}
			return isWithinThreshold;
		});

		if (connectDisconnectsInThreshold > CONNECT_DISCONNECT_WARNING_THRESHOLD_QUANTITY) {
			log.warn(
				`createSequentialRoomConnectDisconnect: room connect / disconnect occurring in rapid sequence (over ${CONNECT_DISCONNECT_WARNING_THRESHOLD_QUANTITY}x in ${CONNECT_DISCONNECT_WARNING_THRESHOLD_MS}ms). This is not recommended and may be the sign of a bug like an effect dependency changing every render.`
			);
		}
	};

	const connect = (...args: Parameters<ConnectFn>) => {
		return new Promise((resolve, reject) => {
			const room = getRoom();
			if (!room) {
				throw new Error('Called connect(), but room was unset');
			}
			const now = new Date();
			checkConnectDisconnectThreshold(now);
			connectDisconnectQueue.push({
				type: 'connect',
				room,
				args,
				resolve,
				reject
			} as QueueItem);
			connectDisconnectEnqueueTimes.push(now);
			processConnectsAndDisconnects();
		}) as ReturnType<ConnectFn>;
	};

	const disconnect = (...args: Parameters<DisconnectFn>) => {
		return new Promise((resolve, reject) => {
			const room = getRoom();
			if (!room) {
				throw new Error('Called disconnect(), but room was unset');
			}
			const now = new Date();
			checkConnectDisconnectThreshold(now);
			connectDisconnectQueue.push({
				type: 'disconnect',
				room,
				args,
				resolve,
				reject
			} as QueueItem);
			connectDisconnectEnqueueTimes.push(now);
			processConnectsAndDisconnects();
		}) as ReturnType<DisconnectFn>;
	};

	return {
		get connect() {
			return (getRoom() ? connect : null) as ConnectFn | null;
		},
		get disconnect() {
			return (getRoom() ? disconnect : null) as DisconnectFn | null;
		}
	};
}

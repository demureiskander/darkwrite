/**
 * Event arguments that will be passed to event bus listeners.
 * @template T type of the data field
 */
export interface EventBusListenerArgs<T> {
    /** An identifier that is randomly generated at broadcast time */
    id: string;
    data: T;
    channel: string;
    /** The unique identifier of the event bus that broadcasted this message. */
    sourceId?: string;
    timestamp: number;
}
/**
 * Generic type definition of an event bus listener.
 * @template T type of event data
 */
export type EventBusListener<T> = (event: EventBusListenerArgs<T>) => void;
/**
 * A message broker interface to connect external sources, like websockets and postmessage, into an `EventBus`
 * @template T type of message data
 */
export interface MessageBroker<T extends EventBusListenerArgs<unknown>> {
    emit: (channel: string, data: T) => void;
}
/**
 * Type map to define event bus channels.
 */
export type EventMap = Record<string, unknown>;
/**
 * A generic, type-safe event bus that performs publish/subscribe on a
 * defined set of typed channels.
 * @template Events the message data type map for channels
 */
export declare class EventBus<Events extends EventMap> {
    private id;
    /**
     * Map of event listeners for each channel.
     */
    readonly listeners: Map<keyof Events, Set<EventBusListener<Events[keyof Events]>>>;
    constructor();
    /**
     * Add a listener to a channel defined in `Events`. The same listener cannot be added twice.
     * **Do NOT add anonymous functions from React components, this will cause memory leaks.**
     * @param channel a valid channel key
     * @param fn the listener function
     * @returns a method to unsubscribe the listener
     */
    subscribe<K extends keyof Events = keyof Events>(channel: K, fn: EventBusListener<Events[K]>): () => void;
    /**
     * Remove a known listener from a channel.
     * @param channel a valid channel key
     * @param fn the listener function
     */
    unsubscribe<K extends keyof Events = keyof Events>(channel: K, fn: EventBusListener<Events[K]>): void;
    /** Removes all listeners of a channel.
     * @param channel a valid channel name
     */
    removeAllListeners<K extends keyof Events = keyof Events>(channel: K): void;
    /**
     * Register multiple handlers to a channel at once.
     * @param channel a valid channel name
     * @param handlers
     * @returns a method to unsubscribe all handlers that were just registered
     */
    subscribeMany<K extends keyof Events = keyof Events>(channel: K, ...handlers: EventBusListener<Events[K]>[]): () => void;
    /**
     * Synchronously and sequentially emit a message to all listeners.
     * @param channel a valid channel name
     * @param data message data
     */
    emit<K extends keyof Events = keyof Events>(channel: K, data: Events[K]): void;
}

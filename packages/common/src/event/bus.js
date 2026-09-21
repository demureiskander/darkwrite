import { nanoid } from "nanoid";
/**
 * A generic, type-safe event bus that performs publish/subscribe on a
 * defined set of typed channels.
 * @template Events the message data type map for channels
 */
export class EventBus {
    id;
    /**
     * Map of event listeners for each channel.
     */
    listeners = new Map();
    constructor() {
        this.id = nanoid();
    }
    /**
     * Add a listener to a channel defined in `Events`. The same listener cannot be added twice.
     * **Do NOT add anonymous functions from React components, this will cause memory leaks.**
     * @param channel a valid channel key
     * @param fn the listener function
     * @returns a method to unsubscribe the listener
     */
    subscribe(channel, fn) {
        if (!this.listeners.has(channel))
            this.listeners.set(channel, new Set());
        // biome-ignore lint/style/noNonNullAssertion: see above line
        const listeners = this.listeners.get(channel);
        listeners.add(fn);
        return () => this.unsubscribe(channel, fn);
    }
    /**
     * Remove a known listener from a channel.
     * @param channel a valid channel key
     * @param fn the listener function
     */
    unsubscribe(channel, fn) {
        const listeners = this.listeners.get(channel);
        if (!listeners)
            return;
        listeners.delete(fn);
    }
    /** Removes all listeners of a channel.
     * @param channel a valid channel name
     */
    removeAllListeners(channel) {
        this.listeners.delete(channel);
    }
    /**
     * Register multiple handlers to a channel at once.
     * @param channel a valid channel name
     * @param handlers
     * @returns a method to unsubscribe all handlers that were just registered
     */
    subscribeMany(channel, ...handlers) {
        handlers.forEach((handler) => this.subscribe(channel, handler));
        return () => {
            handlers.forEach((handler) => this.unsubscribe(channel, handler));
        };
    }
    /**
     * Synchronously and sequentially emit a message to all listeners.
     * @param channel a valid channel name
     * @param data message data
     */
    emit(channel, data) {
        const listeners = this.listeners.get(channel);
        if (!listeners)
            return;
        const eventArgs = {
            id: nanoid(),
            data,
            channel: channel,
            sourceId: this.id,
            timestamp: Date.now(),
        };
        listeners.forEach((listener) => {
            listener(eventArgs);
        });
    }
}

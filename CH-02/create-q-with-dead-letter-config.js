import amqplib from 'amqplib';

const uri = process.env.RABBITMQ_URI;

export const createQueueWithDeadLetterConfig = async () => {
    // Create a connection
    const conn = await amqplib.connect(uri);

    // Create channel
    const channel = await conn.createChannel();

    // Assert exchange ( creates if it does not already exist)
    const exchangeName = 'example-exchange';
    const exchangeType = 'direct';
    const exchangeOptions = {
        durable: true, // tells whether the exchange survives a broker restart.
        autoDelete: false, // tells if the exchange should be deleted when the last queue is unbound (note: this behaviour comes into effect only after at least one queue has been bound).
    };

    try {
        await channel.assertExchange(exchangeName, exchangeType, exchangeOptions);
    } catch (error) {
        throw error;
    }

    // Create queue
    const q1 = 'example-q';
    try {
        await channel.assertQueue(q1, { // understand these options
            durable: true, // tells if the queue will survive a broker restart. (note: it does not make messages persistent)
            exclusive: false, // true = only accessible to the connection which ceated this queue. other connections cannot access this queue. also, the queue is deleted when the creator-connection is closed.
            autoDelete: false, // tells if the queue should be deleted when the last consumer disconnects (note: it is in effect only after at least 1 consumer joined)
            arguments: {
                'x-message-ttl': 60000, // time in millisecond a message can stay in this queue. if the message is not consumed, it will be discarded or sent to dead-letter exchange (if configured)
                'x-expires': 1000000, // idle time duration (no delivery/ no consume). after this much idle time, the queue will be deleted.
                'x-max-length': 30, // max number of message that this queue can hold at a time. when this limit is reached, 'x-overflow' behaviour come into effect.
                'x-max-length-bytes': 30000, // 30 KB. it is the max allowed bytes of data in the queue at a time (sum of body sizes of all messages). if this limit is reached, 'x-overflow' comes into effect.
                'x-overflow': 'drop-head', // or reject-publish: this defines the behaviour in case the queue has reached max limit on number of messages. drop-head = discard/dead-letter oldest message. reject-publish = do not accept new messages.
                'x-max-priority': 10, // sets the maximum priority value that this queue will support. (0 to 10). messages with higher priority will be consumed first. if 2 messages have same priority then FIFO is followed. [note: priority on messages is set by the publisher. here on the queue, we are only saying that this queue will support priority based messages. otherwise priority would be ignored.]
                'x-dead-letter-exchange':'my-dlx-example-exchnage', // exchnage where dead messages should be published.
                'x-dead-letter-routing-key':'' // message will be published to dlx with this routing key. using empty string as my DLX is of fanout type.
            }
        });

        // Lets bind these queues to 'defense_forces_notifications'
        await channel.bindQueue(q1, exchangeName, 'routing.key');

    } catch (error) {
        throw error;
    }

    await channel.close();
    await conn.close();
}
import amqplib from 'amqplib';

const uri = process.env.RABBITMQ_URI;

export const deleteQueue = async () => {
    // Create connection
    const conn = await amqplib.connect(uri);

    // Create channel
    const channel = await conn.createChannel();

    // Delete queue
    await channel.deleteQueue('test-q',{
        ifEmpty: false, // fefault=false. true = delete only if queue has no messages.
        ifUnused: false, // default = false. true = delete only if no consumers are connected to queue.
    });

    // Close channel and connection
    await channel.close();
    await conn.close();
}
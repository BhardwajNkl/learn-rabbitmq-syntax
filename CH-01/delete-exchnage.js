import amqplib from 'amqplib';

const uri = process.env.RABBITMQ_URI;

export const deleteExchnage = async () => {
    // Create a connection
    const conn = await amqplib.connect(uri);

    // Create channel
    const channel = await conn.createChannel();

    // Delete
    // const exchangeName = 'demo-delete-exchnage';
    const exchangeName = 'notifications';

    try {
        await channel.deleteExchange(
            exchangeName,
            {
                ifUnused: true // this telles that delete only if no queues are bound. 'false' means delete anyway.
            }
        )
    } catch (error) {
        throw error;
    } finally {
        await channel.close();
        await conn.close();
    }
}
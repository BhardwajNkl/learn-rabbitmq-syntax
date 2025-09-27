import amqplib from 'amqplib';

const uri = process.env.RABBITMQ_URI;

export const createAlternateExchange = async () => {
    // Create a connection
    const conn = await amqplib.connect(uri);

    // Create channel
    const channel = await conn.createChannel();

    // Assert exchange ( creates if it does not already exist)
    const exchangeName = 'catch-all-exchange';
    const exchangeType = 'fanout'; // only fanout makes sense as we are handling routing failure case.
    const exchangeOptions = {
        durable: true, // tells whether the exchange survives a broker restart.
        autoDelete: false, // tells if the exchange should be deleted when the last queue is unbound (note: this behaviour comes into effect only after at least one queue has been bound).
    };

    try {
        await channel.assertExchange(exchangeName, exchangeType, exchangeOptions);
    } catch (error) {
        throw error;
    }

    // Lets bind only 1 queue to this exchnage
    try {
        const q= await channel.assertQueue(
            'catch-all-q',
            {
                durable: true,
            }
        );

        await channel.bindQueue('catch-all-q', 'catch-all-exchange', '');
    } catch (error) {
        throw error;
    }

    await channel.close();
    await conn.close();
}
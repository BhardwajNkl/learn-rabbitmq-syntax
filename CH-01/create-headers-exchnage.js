import amqplib from 'amqplib';

const uri = process.env.RABBITMQ_URI;

export const createHeadersExchnage = async () => {
    // Create a connection
    const conn = await amqplib.connect(uri);

    // Create channel
    const channel = await conn.createChannel();

    // Assert exchange ( creates if it does not already exist)
    const exchangeName = 'smartphone_service_requests';
    const exchangeType = 'headers';
    const exchangeOptions = {
        durable: true, // tells whether the exchange survives a broker restart.
        autoDelete: false, // tells if the exchange should be deleted when the last queue is unbound (note: this behaviour comes into effect only after at least one queue has been bound).
    };

    try {
        await channel.assertExchange(exchangeName, exchangeType, exchangeOptions);
    } catch (error){
        throw error;
    } finally {
        await channel.close();
        await conn.close();
    }
}
import amqplib from 'amqplib';

export const consume = async () => {
    const conn = await amqplib.connect('amqp://guest:guest@localhost:5672');

    const channel = await conn.createChannel();

    // make sure that a queue is bound to the exchange: again not mandatory if already done.
    await channel.assertQueue(
        "matrix_logs_q",
        {
            autoDelete: false,
            durable: true
        }
    )
    await channel.bindQueue("matrix_logs_q", "logsExchange", "matrix_log");

    channel.consume("matrix_logs_q", (message) => {
        console.log("received message = ", message);
        try {
            const data = message.content.toString();
            console.log(data);
            const abc = JSON.parse(data);
            console.log(abc);
        } catch (error) {
            console.log("error while parsing");
        } finally {
            channel.ack(message);
        }
    }
    )
}
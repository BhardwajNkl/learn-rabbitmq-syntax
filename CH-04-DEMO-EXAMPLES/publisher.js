import amqplib from 'amqplib';

export const publish = async () => {
    const conn = await amqplib.connect('amqp://guest:guest@localhost:5672');

    const channel = await conn.createChannel();

    // make sure that the xchange exists: not mandatory if you are sure that the exchange does exist.
    await channel.assertExchange(
        "demo_direct_exchange",
        "direct",
        {
            autoDelete: false,
            durable: true,

        }
    )

    // make sure that a queue is bound to the exchange: again not mandatory if already done.
    await channel.assertQueue(
        "demo_q",
        {
            autoDelete:false,
            durable: true
        }
    )
    await channel.bindQueue("demo_q","demo_direct_exchange","notification.email");

    const fakeNotification = {
        notificationData: "This is a fake notification",
        notificationChannel: "email"
    }
    channel.publish(
        "demo_direct_exchange",
        "notification.email",
        Buffer.from(JSON.stringify(fakeNotification)),
        {
            persistent: false
        }
    )

    await channel.close();
    await conn.close();
}
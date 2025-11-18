const amqp = require('amqplib');

// Acknowledgment Functions
async function consumeMessages() {
    const conn = await amqp.connect('amqp://localhost');
    const channel = await conn.createChannel();
    const queue = 'ack_nack_queue';
    
    await channel.assertQueue(queue, { durable: true });
    
    // 1. Crucial step: Set noAck to false for manual acknowledgment
    channel.consume(queue, (msg) => {
        if (msg === null) return;
        
        const content = msg.content.toString();
        const deliveryTag = msg.fields.deliveryTag;

        console.log(`[x] Received message: '${content}'`);
        
        // --- 1. Successful Processing: ACK ---
        if (content.includes('SUCCESS')) {
            // channel.ack(msg, [allUpTo]);
            // The second argument 'false' means: only acknowledge this single message.
            channel.ack(msg); 
            console.log(`\t✅ ACK: Message ${deliveryTag} processed successfully and removed from queue.`);
        } 
        
        // --- 2. Transient/Temporary Failure: NACK & Requeue ---
        else if (content.includes('REQUEUE')) {
            // channel.nack(msg, [allUpTo], [requeue]);
            // The third argument 'true' means: put the message back into the queue.
            channel.nack(msg, false, true); 
            console.log(`\t⚠️ NACK & REQUEUE: Message ${deliveryTag} failed temporarily, redelivering soon.`);
        } 
        
        // --- 3. Permanent/Fatal Failure: REJECT & Discard (or Dead Letter) ---
        else if (content.includes('REJECT')) {
            // channel.reject(msg, [requeue]);
            // The second argument 'false' means: do NOT requeue. Discard the message 
            // or send it to a Dead Letter Exchange (DLX) if configured.
            channel.reject(msg, false); 
            console.log(`\t❌ REJECT & DISCARD: Message ${deliveryTag} failed permanently, discarding.`);
        } 
        
        // --- 4. Batch Acknowledgment Example (ACK All Up To) ---
        else if (content.includes('BATCH')) {
            // Assuming this is the last successful message in a batch, 
            // acknowledge it and ALL previously delivered, unacknowledged messages 
            // on this channel.
            channel.ack(msg, true);
            console.log(`\t✨ BATCH ACK: Message ${deliveryTag} and all prior unacked messages acknowledged.`);
        }
        
    }, {
        // **Crucial Configuration:** Disables automatic acknowledgment
        noAck: false 
    });

    console.log(" [*] Waiting for messages in %s. To test: SUCCESS, REQUEUE, REJECT, or BATCH.", queue);
}

// Producer to send test messages (simplified for demonstration)
async function sendTestMessages() {
    const conn = await amqp.connect('amqp://localhost');
    const channel = await conn.createChannel();
    const queue = 'ack_nack_queue';
    
    await channel.assertQueue(queue, { durable: true });

    ['REQUEUE', 'SUCCESS', 'REJECT', 'BATCH'].forEach(word => {
        channel.sendToQueue(queue, Buffer.from(`Test Message: ${word}`), { persistent: true });
        console.log(` [P] Sent 'Test Message: ${word}'`);
    });

    setTimeout(() => {
        conn.close();
    }, 500);
}

// Run the consumer and producer
sendTestMessages();
consumeMessages();
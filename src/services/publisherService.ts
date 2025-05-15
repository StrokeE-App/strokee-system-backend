import amqp from "amqplib";

export const publishToExchange = async (
  exchangeName: string,
  routingKey: string,
  message: object
) => {
  try {
    const connection = await amqp.connect(process.env.RABBIT_MQ || "amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, "direct", { durable: true });

    const messageBuffer = Buffer.from(JSON.stringify(message));

    const sent = channel.publish(exchangeName, routingKey, messageBuffer, { persistent: true });

    if (sent) {
      console.log(`Mensaje enviado a ${exchangeName} con routingKey "${routingKey}":`, message);
    } else {
      console.error("Error al enviar el mensaje.");
    }

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error al publicar mensajes a RabbitMQ Exchange:", error);
  }
};

const amqplib = require("amqplib/callback_api");

amqplib.connect("amqp://localhost", (err, connection) => {
  if (err) process.exit();
  else {
    const queueName = "HandleSingleUpload";

    connection.createChannel((err, channel) => {
      if (err) {
        console.log("Error in worker single upload");
        process.exit();
      }
      channel.assertQueue(queueName, { durable: false });
      channel.consume(
        queueName,
        (message) => {
          try {
            console.log("Waiting for messages");
            console.log(`${message}`);
            console.log(`${JSON.parse(message.content)}`);
          } catch (error) {
            console.log("erro in hanle image");
          }
        },
        { noAck: true }
      );
    });
  }
});

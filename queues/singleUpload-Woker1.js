const amqplib = require("amqplib/callback_api");
const { handleSingleImageWithSharp } = require("../middlewares/helper");

function sendValueToSingleUploadQueue(file) {
  amqplib.connect("amqp://localhost", (err, connection) => {
    if (err) process.exit();

    const queueName = "HandleSingleUpload";
    connection.createChannel(async (error, channel) => {
      if (error) {
        console.log(error);
        process.exit();
      } else {
        let singleUploadResult = await handleSingleImageWithSharp(file);
        console.log(singleUploadResult);
        //assertinng
        // durable = true - ghi trên disk
        // transient queue
        channel.assertQueue(queueName, { durable: false });
        channel.sendToQueue(
          queueName,
          Buffer.from(JSON.parse(singleUploadResult))
        );
        console.log("return sing upload image result");
        console.log(`Queue name is - ${queueName}`);
      }
      // try {
      //   if (error) {
      //     console.log(error);
      //     process.exit();
      //   } else {
      //     let singleUploadResult = await handleSingleImageWithSharp(file);
      //     //onsole.log(singleUploadResult);
      //     //assertinng
      //     // durable = true - ghi trên disk
      //     // transient queue
      //     channel.ascsertQueue(queueName, { durable: false });
      //     channel.sendToQueue(
      //       queueName,
      //       Buffer.from(JSON.stringify(singleUploadResult))
      //     );
      //     console.log("return sing upload image result");
      //     console.log(`Queue name is - ${queueName}`);
      //   }
      // } catch (error) {
      //   console.log("error in cath worker");
      //   console.log(error);
      // }
    });
  });
}

module.exports = sendValueToSingleUploadQueue;

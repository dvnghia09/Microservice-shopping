const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");

const {
  APP_SECRET,
  BASE_URL,
  EXCHANGE_NAME,
  MSG_QUEUE_URL,
} = require("../config");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

// module.exports.PublishCustomerEvent = async (payload) => {
//   axios.post("http://localhost:8000/customer/app-events/", {
//     payload,
//   });

//   //     axios.post(`${BASE_URL}/customer/app-events/`,{
//   //         payload
//   //     });
// };

// module.exports.PublishShoppingEvent = async (payload) => {
//   // axios.post('http://gateway:8000/shopping/app-events/',{
//   //         payload
//   // });

//   axios.post(`http://localhost:8000/shopping/app-events/`, {
//     payload,
//   });
// };

// --------Message Broker----------

// create a channel
module.exports.CreateChannel = async() => {
  try {
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    return channel;
  } catch (err) {
    throw err;
  }
}

// public messages
module.exports.PublishMessage = async(channel, service, msg) => {
  channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
  console.log("Sent: ", msg);
}

// subscribe messages

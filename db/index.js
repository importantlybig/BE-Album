const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Database is connected ^_^');
}).catch((error) => {
    console.log(`Database connection failed: ${error}`);
})
const express = require('express');
const bodyParser = require('body-parser');
const dialogflowRoute = require('./routes/dialogflow');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

app.use('/api', dialogflowRoute);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

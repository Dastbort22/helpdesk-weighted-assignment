require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes/helpdesk.routes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
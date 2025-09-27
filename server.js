const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.port || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Prometheus metrics
let requestCount = 0;
let errorCount = 0;
let calculationCount = 0;

// Middleware to track metrics
app.use((req, res, next) => {
    requestCount++;
    if (req.path !== '/health' && req.path !== '/metrics') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});


app.get('/', (req, res) => {
  res.send('Task 5.1P - Containerization');
});

const operations = {
  exponentiate: (num1, num2) => Math.pow(num1, num2),
  mod: (num1, num2) => num1 % num2
};

app.post("/", (req, res) => {
  const { num1, num2, operation } = req.body;
  const n1 = Number(num1);
  const n2 = Number(num2);

  if (isNaN(n1)) {
    errorCount++;
    return res.status(400).send('Num1 is not a valid number');
  }

  if (isNaN(n2)) {
    errorCount++;
    return res.status(400).send('Num2 is not a valid number');
  }

  if (!operation || !operations[operation]) {
    errorCount++;
    return res.status(400).send('Invalid operation.');
  }

  const result = operations[operation](n1, n2);
  calculationCount++;

  res.json({ result });
});


// Exponentiation Endpoint
app.post('/exponentiate', (req, res) => {
  const { num1, num2 } = req.body;
  const n1 = Number(num1);
  const n2 = Number(num2);

  if (isNaN(n1) || isNaN(n2)) {
    errorCount++;
    return res.status(400).json({ error: 'Base and exponent must be valid numbers' });
  }

  const result = Math.pow(n1, n2);
  calculationCount++;
  res.json({ operation: 'exponentiation', num1: n1, num2: n2, result });
});

// Modulo Endpoint
app.post('/modulo', (req, res) => {
  const { num1, num2 } = req.body;
  const n1 = Number(num1);
  const n2 = Number(num2);

  if (isNaN(n1) || isNaN(n2)) {
    errorCount++;
    return res.status(400).json({ error: 'Dividend and divisor must be valid numbers' });
  }

  if (n2 === 0) {
    errorCount++;
    return res.status(400).json({ error: 'Cannot perform modulo by zero' });
  }

  const result = n1 % n2;
  calculationCount++;
  res.json({ operation: 'modulo', num1: n1, num2: n2, result });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Prometheus metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${requestCount}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${errorCount}

# HELP calculations_total Total number of calculations performed
# TYPE calculations_total counter
calculations_total ${calculationCount}

# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes ${JSON.stringify(process.memoryUsage()).replace(/[{}"]/g, '').replace(/:/g, ' ').replace(/,/g, '\nnodejs_memory_usage_bytes ')}

# HELP nodejs_uptime_seconds Uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}
`;

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});


app.listen(PORT,
  () => console.log(`Server running on port: ${PORT}`)
);
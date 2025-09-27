const request = require('supertest');
const express = require('express');
const path = require('path');

// Create a test app without starting the server
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Prometheus metrics
let requestCount = 0;
let errorCount = 0;
let calculationCount = 0;

// Middleware to track metrics
app.use((req, res, next) => {
    requestCount++;
    next();
});

app.get('/', (req, res) => {
  res.send('Task 5.1P - Containerization');
});

app.get('/api', (req, res) => {
  res.send('Task 5.1P - Containerization');
});

const operations = {
  exponentiate: (num1, num2) => Math.pow(num1, num2),
  mod: (num1, num2) => num1 % num2
};

app.post('/', (req, res) => {
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

describe('Calculator API Tests', () => {
  
  describe('GET /', () => {
    it('should serve frontend HTML', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      // Since we're serving static files, it should return the HTML content
      expect(response.text).toContain('Calculator API Frontend');
    });
  });

  describe('GET /api', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.text).toContain('Task 5.1P - Containerization');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('calculations_total');
      expect(response.text).toContain('nodejs_memory_usage_bytes');
      expect(response.text).toContain('nodejs_uptime_seconds');
    });
  });

  describe('POST /exponentiate', () => {
    it('should calculate exponentiation correctly', async () => {
      const response = await request(app)
        .post('/exponentiate')
        .send({ num1: 2, num2: 3 })
        .expect(200);
      
      expect(response.body.operation).toBe('exponentiation');
      expect(response.body.num1).toBe(2);
      expect(response.body.num2).toBe(3);
      expect(response.body.result).toBe(8);
    });

    it('should handle invalid numbers', async () => {
      const response = await request(app)
        .post('/exponentiate')
        .send({ num1: 'invalid', num2: 3 })
        .expect(400);
      
      expect(response.body.error).toContain('valid numbers');
    });

    it('should handle missing parameters', async () => {
      const response = await request(app)
        .post('/exponentiate')
        .send({ num1: 2 })
        .expect(400);
      
      expect(response.body.error).toContain('valid numbers');
    });
  });

  describe('POST /modulo', () => {
    it('should calculate modulo correctly', async () => {
      const response = await request(app)
        .post('/modulo')
        .send({ num1: 10, num2: 3 })
        .expect(200);
      
      expect(response.body.operation).toBe('modulo');
      expect(response.body.num1).toBe(10);
      expect(response.body.num2).toBe(3);
      expect(response.body.result).toBe(1);
    });

    it('should handle division by zero', async () => {
      const response = await request(app)
        .post('/modulo')
        .send({ num1: 10, num2: 0 })
        .expect(400);
      
      expect(response.body.error).toContain('Cannot perform modulo by zero');
    });

    it('should handle invalid numbers', async () => {
      const response = await request(app)
        .post('/modulo')
        .send({ num1: 'invalid', num2: 3 })
        .expect(400);
      
      expect(response.body.error).toContain('valid numbers');
    });
  });

  describe('POST / (generic operation)', () => {
    it('should handle exponentiate operation', async () => {
      const response = await request(app)
        .post('/')
        .send({ num1: 2, num2: 3, operation: 'exponentiate' })
        .expect(200);
      
      expect(response.body.result).toBe(8);
    });

    it('should handle mod operation', async () => {
      const response = await request(app)
        .post('/')
        .send({ num1: 10, num2: 3, operation: 'mod' })
        .expect(200);
      
      expect(response.body.result).toBe(1);
    });

    it('should handle invalid operation', async () => {
      const response = await request(app)
        .post('/')
        .send({ num1: 2, num2: 3, operation: 'invalid' })
        .expect(400);
      
      expect(response.text).toContain('Invalid operation');
    });

    it('should handle missing operation', async () => {
      const response = await request(app)
        .post('/')
        .send({ num1: 2, num2: 3 })
        .expect(400);
      
      expect(response.text).toContain('Invalid operation');
    });

    it('should handle invalid numbers', async () => {
      const response = await request(app)
        .post('/')
        .send({ num1: 'invalid', num2: 3, operation: 'exponentiate' })
        .expect(400);
      
      expect(response.text).toContain('not a valid number');
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for unknown routes', async () => {
      await request(app)
        .get('/unknown')
        .expect(404);
    });
  });

  describe('Static file serving', () => {
    it('should serve frontend HTML', async () => {
      const response = await request(app)
        .get('/index.html')
        .expect(200);
      
      expect(response.text).toContain('Calculator API Frontend');
    });
  });
});

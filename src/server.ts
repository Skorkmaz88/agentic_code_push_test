import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Dashboard route
app.get('/dashboard', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// API route for dashboard data (placeholder)
app.get('/api/dashboard', (req: Request, res: Response) => {
  res.json({
    message: 'Dashboard data loaded successfully',
    timestamp: new Date().toISOString()
  });
});

// Root route redirects to dashboard
app.get('/', (req: Request, res: Response) => {
  res.redirect('/dashboard');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}/dashboard`);
});

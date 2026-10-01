import app from './app';
import { AppDataSource } from './config/data-source';

const PORT = Number(process.env.PORT) || 5000;

// Connect to the database first — TypeORM (unlike Prisma) doesn't connect
// lazily on the first query, so no request may run before this resolves.
AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Could not connect to the database:', err);
    process.exit(1);
  });

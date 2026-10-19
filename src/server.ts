import app from './app';
import { AppDataSource } from './config/data-source';

const PORT = Number(process.env.PORT) || 5000;


AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[db] Could not connect to the database — the server is NOT running:', err);
    process.exit(1);
  });

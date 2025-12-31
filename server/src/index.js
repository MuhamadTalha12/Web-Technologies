import { env } from './lib/env.js';
import app from './app.js';

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.port}`);
});

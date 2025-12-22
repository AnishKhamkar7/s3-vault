import cors from 'cors';
import { env } from './utils/env';

const corsOptions = {
  origin: [env.CLIENT_URL], // Update to match your URL
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default cors(corsOptions);

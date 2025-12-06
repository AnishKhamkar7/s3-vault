import path from 'path';

const baseDir = path.join(__dirname);

export const TEMPLATES = { verification: path.join(baseDir, 'email-verification.ejs') };

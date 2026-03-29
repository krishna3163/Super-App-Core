import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import admin from 'firebase-admin';
import connectDB from './config/db.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5013;

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "supperapp-f0f5e",
  private_key_id: "2b42ac53d94ebc4cbbdc791d9064e40396299e41",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDzHr9SL6lgibWi\nWBigUWxpZOfJTIqSLm7kvZc/ZSG5OxFF+RxBhmsOs6z4i9Br5g6ptqkJqiJ52gsS\nt2UXyQOgK7qwstIMI2w9RmdoajeivP3KlAZMtybwBqnG0xeuP0+qUzVWf0D9OgW2\nzq/XR4MZTIY29S4v+8KMXJQWKzHc5HMAD3AKunhT4FwWEtlTp/SR2X157q5RGcuB\nNUx3//dHH5rJTo3ZQ24npVTlDsla+opxnWcMKBWm2bRECl4TJGqUI57UeLkrYwJf\n95d96zxwPfu2cpBf4E5vG6KwtlemEToUGfnx+aHSSJJSV24GjxpuMzMZF81cawRL\nL4Xf9kYjAgMBAAECggEABMV4T15pSy0iTm+Lx2GxtTCdlLrKB9JqqyL5aLoZ+yIP\nCO0gDwn0G4bCAOK/K87vcyJtl0Eqigx4csNjDYamNpEevQ1u+xc0ezaT6V2xF9WK\nGZBMJPQXPiPmiX6Z4WAtHRRvxvHNm1EPMz/dMMyesXMDoBwYIVyMiRqsB79ZrCvm\nnWro/C6XNJ9MT9AhcbvnGJ/vRgUOp+Dzdl67TJu2mufraXG+BZaTyapVsG+FhILz\nfXK6nB5inVpsIk/L+mgJZhzn+WfqoTh/f7xe0+JVvpToWSybRIIEVxCl42CEHtv+\nfz5B/hmQL3+XTrZZAsurzJCnna4rc8wuhZoCwoP0CQKBgQD6UrHUwuQoxHpEZ3om\nalOxh+w9thbkx9NXoi4mv2H8oLR7N6v25vp46zir+dH8mzXfNALCXQhXL3djvCQB\nBc4vjzmbwlFu8QgB+rl0/ZfUIOa+squQRGB3SqAfFaqn1KkJFwVzV5hJcrQI798Z\ncdcpLIBNeFIzKyyxMPG/tLh4ZwKBgQD4ojwMbyG1Q9L6cQGehG2xUbFmOlKoMMhQ\nvLcfAXY1hWS7EByV4q5Fo1dpbq29+VsFNHwFIJ2CF1JqBUQ2AChfImPsjrtdljR7\n80LMqodj1AwtCSkJhNonQg/D7df/Zb7cO07L4EArOEFg1yJIVOQrU//ZGgcE16F1\n5bWPxGWe5QKBgQDorDzHOm/AxP+w3U3YrzQj6+dWZQ5akLKM3h5vvaximS2o6lJZ\nKNDf3CPNFmRsnAgy87Es4DSEdYZPme0NVkwUQNiXQsNWj4uV62q+p4ickAhqcMCv\nVB8mQqMawZTicvS7kj5qu5y9iHR3ah7BE+OeTdLkL1aYYSUlfgz22BAvOQKBgQCU\nr7BpXywxUlYhHuNxAJD4sXn9QHOd0U55ueFo0V73ssYCeCggGmdNjdkAXAfay/v6\nqOBh0Jdg7MGEVZHtGTsLaW2IUfMKjIDmfxs7ed9te6msZQX9g01SnNcAvIOnYBk7\natw8X+b/8axnVUBTMTEiGCGwmzgHVUxhTPW+/BwpYQKBgQC6m3CsHdzTQmtswyu1\nSEbj+RhWahSbPu3Nmsa7lVLvsTWiSqwFIl1/A2ZLA5Iqbblq1vtDnIVaQTrZoW9A\nTG5U6ve2jpK6/zH2dtvYBZE2S3bCgtoylQ2/d6Fk1jH8OxpjVJYl7PGo92zN5Y0/\ntWZq3mwTDfNRWRTy9YjS32GtFQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@supperapp-f0f5e.iam.gserviceaccount.com"
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin Initialized');
} catch (error) {
  console.error('❌ Firebase Admin Init Error:', error.message);
}

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/notify', notificationRoutes);
app.use('/', notificationRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification Service is running' });
});

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Notification Service running on port ${PORT}`);
  });
});

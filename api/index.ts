import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';
import { Application } from 'express';

// Cache the app and db connection
let app: Application | null = null;
let dbConnected = false;

async function getApp() {
    if (!dbConnected) {
        console.log('Connecting to MongoDB...');
        await connectDatabase();
        dbConnected = true;
        console.log('MongoDB connected successfully');
    }

    if (!app) {
        console.log('Creating Express app...');
        app = createApp();
        console.log('Express app created');
    }

    return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Fallback for OPTIONS (Fast Path)
    // Note: Standard requests are handled by Express CORS middleware
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.status(200).end();
        return;
    }

    try {
        const expressApp = await getApp();

        // Debug Log
        console.log(`[Vercel TS] ${req.method} ${req.url}`);

        // Forward to Express
        // CASTING: Express app is a request listener, but types might clash slightly with VercelRequest
        // but at runtime it works as (req, res) handler.
        // We cast to any to avoid strict signature mismatch (VercelRequest is extension of IncomingMessage)
        // Express handler expects (req, res) compatible objects.
        return (expressApp as any)(req, res);

    } catch (error: any) {
        console.error('Serverless function error:', error.message || error);

        if (!res.headersSent) {
            const origin = req.headers.origin || '*';
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

            res.status(500).json({
                success: false,
                error: {
                    code: 'FUNCTION_INVOCATION_FAILED',
                    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
                },
            });
        }
    }
}

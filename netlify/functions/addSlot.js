/* netlify/functions/addSlot.js */

const jwt = require('jsonwebtoken');
const db = require('./_db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

exports.handler = async (event) => {
    try {
        const authHeader = event.headers.authorization;
        if (!authHeader) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Authorization required' })
            };
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = verifyToken(token);

        if (decoded.role !== 'owner') {
            return {
                statusCode: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Only owners can add slots' })
            };
        }

        const { condoId, condoName, tower, floor, slotNumber, availableFrom, availableTo, rateType, ratePHP, cutoffLabel, ownerContact } = JSON.parse(event.body);

        if (!condoId || !condoName || !tower || !floor || !slotNumber || !availableFrom || !availableTo || !rateType || ratePHP === undefined || !cutoffLabel || !ownerContact) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const newSlot = db.addSlot({
            ownerId: decoded.userId,
            condoId,
            condoName,
            tower,
            floor,
            slotNumber,
            availableFrom,
            availableTo,
            rateType,
            ratePHP,
            cutoffLabel,
            ownerContact
        });

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ slot: newSlot })
        };
    } catch (error) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};

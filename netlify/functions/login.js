/* netlify/functions/login.js */

const jwt = require('jsonwebtoken');
const db = require('./_db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

exports.handler = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Email and password required' })
            };
        }

        const user = db.authenticateUser(email, password);

        const token = jwt.sign(
            { userId: user.userId, role: user.role, condoId: user.condoId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                token,
                userId: user.userId,
                role: user.role,
                name: user.name,
                condoId: user.condoId
            })
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

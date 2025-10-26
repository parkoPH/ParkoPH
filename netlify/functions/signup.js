/* netlify/functions/signup.js */

const db = require('./_db');

exports.handler = async (event) => {
    try {
        const { name, email, password, role, condoId } = JSON.parse(event.body);

        if (!name || !email || !password || !role) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        if ((role === 'owner' || role === 'guard') && !condoId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Condo ID required for owner and guard' })
            };
        }

        const user = db.createUser(name, email, password, role, condoId || null);

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'User created successfully',
                userId: user.userId
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};

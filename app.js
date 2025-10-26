/* app.js */

// Auth Helper: Check if user is logged in and has correct role
function checkAuthAndRole(requiredRole) {
    const token = sessionStorage.getItem('authToken');
    const userRole = sessionStorage.getItem('userRole');

    if (!token || !userRole) {
        window.location.href = 'login.html';
        return;
    }

    if (userRole !== requiredRole) {
        alert(`Access denied. You are logged in as ${userRole}, but this page requires ${requiredRole}.`);
        window.location.href = 'login.html';
        return;
    }
}

// Utility: Format time with PH conventions (MN/NN/morning/evening)
function formatPHTime(isoString) {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    let period = 'morning';
    if (hours >= 12 && hours < 17) period = 'noon';
    else if (hours >= 17 && hours < 21) period = 'evening';
    else if (hours >= 21 || hours < 5) period = 'midnight';
    
    if (hours === 0) return `12:00 MN (midnight)`;
    if (hours === 12) return `12:00 NN (noon)`;
    if (hours > 12) return `${hours - 12}:${minutes} ${period === 'evening' ? 'PM (evening)' : 'PM'}`;
    return `${hours}:${minutes} ${hours >= 5 ? 'AM (morning)' : 'AM (midnight)'}`;
}

function formatDateWithTime(isoString) {
    const date = new Date(isoString);
    const monthDay = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    const time = formatPHTime(isoString);
    return `${monthDay}, ${time}`;
}

// Fetch wrapper for Netlify Functions with token
async function callFunction(functionName, method = 'GET', body = null, token = null) {
    const url = `/.netlify/functions/${functionName}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Function error: ${response.statusText}`);
    return response.json();
}

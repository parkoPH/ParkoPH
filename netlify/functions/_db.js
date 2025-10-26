/* netlify/functions/_db.js */

const crypto = require('crypto');

// Seed users with hashed passwords
let users = [
    {
        userId: 'user_owner_001',
        name: 'Maria Santos',
        email: 'owner@example.com',
        passwordHash: hashPassword('password123'),
        role: 'owner',
        condoId: 'prisma_residences'
    },
    {
        userId: 'user_guard_001',
        name: 'Juan Dela Cruz',
        email: 'guard@example.com',
        passwordHash: hashPassword('password123'),
        role: 'guard',
        condoId: 'prisma_residences'
    },
    {
        userId: 'user_parker_001',
        name: 'Liezl Maigue',
        email: 'parker@example.com',
        passwordHash: hashPassword('password123'),
        role: 'parker',
        condoId: null
    }
];

let slots = [
    {
        slotId: 'slot_001',
        ownerId: 'user_owner_001',
        condoId: 'prisma_residences',
        condoName: 'Prisma Residences',
        tower: 'Tower B',
        floor: 'B2',
        slotNumber: 'P37',
        rateType: 'overnight_flat',
        ratePHP: 300,
        availableFrom: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        availableTo: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        cutoffLabel: 'Good until tomorrow 7:00 AM (morning)',
        ownerContact: '0917-000-0000'
    }
];

let bookings = [
    {
        bookingId: 'book_sample_approved',
        parkerId: 'user_parker_001',
        condoId: 'prisma_residences',
        slotId: 'slot_001',
        parkerName: 'Juan dela Cruz',
        plateNumber: 'AAA 1111',
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        cutoffHuman: 'Ends tomorrow 7:00 AM (morning)',
        status: 'approved',
        paymentMethod: 'GCash on arrival',
        qrCodeData: 'book_sample_approved'
    },
    {
        bookingId: 'book_sample_pending',
        parkerId: 'user_parker_001',
        condoId: 'prisma_residences',
        slotId: 'slot_001',
        parkerName: 'Maria Santos',
        plateNumber: 'BBB 2222',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
        cutoffHuman: 'Ends day after tomorrow 7:00 AM (morning)',
        status: 'pending',
        paymentMethod: 'Cash on arrival',
        qrCodeData: null
    }
];

// Password hashing (simple, for MVP only - use bcrypt in production)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'salt_mvp').digest('hex');
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// User helpers
function getUserByEmail(email) {
    return users.find(u => u.email === email.toLowerCase());
}

function getUserById(userId) {
    return users.find(u => u.userId === userId);
}

function createUser(name, email, password, role, condoId = null) {
    if (getUserByEmail(email)) {
        throw new Error('Email already exists');
    }

    const userId = `user_${role}_${Date.now()}`;
    const user = {
        userId,
        name,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role,
        condoId
    };

    users.push(user);
    return user;
}

function authenticateUser(email, password) {
    const user = getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
        throw new Error('Invalid credentials');
    }
    return user;
}

// Slot helpers
function addSlot(slotData) {
    const slotId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSlot = {
        slotId,
        ...slotData
    };
    slots.push(newSlot);
    return newSlot;
}

function getSlots(filter = {}) {
    let result = slots;

    if (filter.condoId) {
        result = result.filter(s => s.condoId === filter.condoId);
    }

    if (filter.startTime && filter.endTime) {
        const reqStart = new Date(filter.startTime);
        const reqEnd = new Date(filter.endTime);
        result = result.filter(s => {
            const slotStart = new Date(s.availableFrom);
            const slotEnd = new Date(s.availableTo);
            return slotStart <= reqStart && slotEnd >= reqEnd;
        });
    }

    return result;
}

function getSlotById(slotId) {
    return slots.find(s => s.slotId === slotId);
}

// Booking helpers
function addBooking(bookingData) {
    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBooking = {
        bookingId,
        status: 'pending',
        ...bookingData
    };
    bookings.push(newBooking);
    return newBooking;
}

function getBookingById(bookingId) {
    return bookings.find(b => b.bookingId === bookingId);
}

function updateBookingStatus(bookingId, newStatus) {
    const booking = getBookingById(bookingId);
    if (booking) {
        booking.status = newStatus;
    }
    return booking;
}

function approveBooking(bookingId) {
    const booking = getBookingById(bookingId);
    if (booking) {
        booking.status = 'approved';
        booking.qrCodeData = bookingId;
    }
    return booking;
}

function getAllBookings() {
    return bookings;
}

module.exports = {
    users,
    slots,
    bookings,
    hashPassword,
    verifyPassword,
    getUserByEmail,
    getUserById,
    createUser,
    authenticateUser,
    addSlot,
    getSlots,
    getSlotById,
    addBooking,
    getBookingById,
    updateBookingStatus,
    approveBooking,
    getAllBookings
};

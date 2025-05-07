const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            time: Date.now()
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

module.exports = generateToken;

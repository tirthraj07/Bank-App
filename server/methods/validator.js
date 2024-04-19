class Validator{
    validateName(name) {
        // Name validation logic
        if (name.trim() === '') {
            return false; // Name cannot be empty
        }
        // Check for special symbols
        const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
        return !specialChars.test(name);
    }
    validateUsername(username) {
        // Username validation logic
        if (username.trim() === '') {
            return false; // Username cannot be empty
        }
        // Check for special symbols
        const specialChars = /[!@#$%^&*(),?":{}|<>]/;
        return !specialChars.test(username);
    }
    validateEmail(email) {
        // Email validation logic
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false; // Invalid email format
        }
        // Check if the domain is from a known provider
        const knownProviders = ['gmail.com', 'hotmail.com', 'yahoo.com']; // Add more providers as needed
        const domain = email.split('@')[1];
        return knownProviders.includes(domain);
    }
    validatePassword(password) {
        // Password validation logic
        if (password.length < 8) {
            return false; // Password must be at least 8 characters long
        }
        // Check for special symbols, numbers, and characters
        const containsSpecialChars = /[!@#$%^&*(),.?":{}|<>_]/;
        const containsNumbers = /\d/;
        const containsLetters = /[a-zA-Z]/;
        return containsSpecialChars.test(password) && containsNumbers.test(password) && containsLetters.test(password);
    }
}

module.exports = Validator;

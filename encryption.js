

// Include CryptoJS library in your HTML file before this script
// <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
const passphrase = atob('c2FjaGlubWFzdGVy');

// Function to encrypt data
function encrypt(data, passphrase) {
    return CryptoJS.AES.encrypt(data, passphrase).toString();
}

// Function to decrypt data
function decrypt(encryptedData, passphrase) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
}


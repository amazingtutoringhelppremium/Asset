// Get redirect parameter from URL
const urlParams = new URLSearchParams(window.location.search);
const redirectTo = urlParams.get('redirect') || '/';

setTimeout(() => {
    window.location.href = redirectTo;
}, 15000);
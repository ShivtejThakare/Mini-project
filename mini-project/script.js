let playerInstance = null;
const DEFAULT_MANIFEST = "https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd";
const DEFAULT_LICENSE_URL = "https://cwip-shaka-proxy.appspot.com/no_auth";

function clearPlayer() {
const video = document.getElementById('protectedVideo');
if (playerInstance) {
playerInstance.destroy();
playerInstance = null;
}
video.src = '';
video.poster = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 640 480\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23161B22\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-size=\'40\' fill=\'%238B949E\'%3EEncrypted%20Video%20Waiting%3C/text%3E%3C/svg%3E';
}

async function loadProtectedVideo() {
const manifestUri = DEFAULT_MANIFEST;
const licenseServer = DEFAULT_LICENSE_URL;
const video = document.getElementById('protectedVideo');

clearPlayer();

playerInstance = new shaka.Player(video);

playerInstance.addEventListener('error', function(event) {
console.error('Shaka Player Error Event:', event.detail);
alert(`DRM Playback Failed (Shaka Error ${event.detail.code}). Check console for details.`);
});

playerInstance.configure({
drm: {
servers: {
'com.widevine.alpha': licenseServer 
}
}
});

try {
await playerInstance.load(manifestUri);
console.log('Widevine Decryption Successful. Video is playing.');
} catch (error) {
}
applyDeterrence();
}

function applyDeterrence() {
const video = document.getElementById('protectedVideo');
const container = video.parentElement;

document.onkeydown = function(e) {
if (e.key === 'PrintScreen' || e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 'I'))) {
e.preventDefault();
console.warn("Client-side key block triggered.");
return false;
}
};

document.onvisibilitychange = function() {
if (!playerInstance || !container) return;
if (document.hidden) {
playerInstance.pause();
container.style.filter = 'blur(10px)';
} else {
if (playerInstance.isPaused() && !playerInstance.isLive() && !playerInstance.getPlaybackRate() == 0) {
playerInstance.play();
}
container.style.filter = 'none';
}
};
}

function addPoint(listId, marker = '▸') {
const list = document.getElementById(listId);
const pointItem = document.createElement('div');
pointItem.className = 'point-item';
pointItem.innerHTML = `
<span class="point-marker">${marker}</span>
<input type="text" class="point-text" placeholder="New point...">
`;
list.appendChild(pointItem);
}

document.querySelectorAll('[contenteditable="true"]').forEach(el => {
el.addEventListener('focus', function() {
if (this.textContent === this.getAttribute('data-placeholder')) {
this.textContent = '';
}
});

el.addEventListener('blur', function() {
if (this.textContent.trim() === '') {
this.textContent = this.getAttribute('data-placeholder');
}
});
});

document.querySelectorAll('.text-input').forEach(textarea => {
textarea.addEventListener('input', function() {
this.style.height = 'auto';
this.style.height = Math.max(60, this.scrollHeight) + 'px';
});
});

function encodeBase64() {
const input = document.getElementById('base64Input').value;
const output = document.getElementById('base64Output');

if (!input.trim()) {
output.value = 'Please enter text to encode';
return;
}

try {
const encoded = btoa(unescape(encodeURIComponent(input)));
output.value = encoded;
} catch (error) {
output.value = 'Error encoding: ' + error.message;
}
}

function decodeBase64() {
const input = document.getElementById('base64Input').value;
const output = document.getElementById('base64Output');

if (!input.trim()) {
output.value = 'Please enter Base64 text to decode';
return;
}

try {
const decoded = decodeURIComponent(escape(atob(input)));
output.value = decoded;
} catch (error) {
output.value = 'Error decoding: Invalid Base64 format';
}
}

document.addEventListener('DOMContentLoaded', function() {
shaka.polyfill.installAll(); 
loadProtectedVideo(); 
});
// URL of the Flask API (adapt it to your server's URL)
const API_URL = 'http://localhost:5000';

// Function to fetch and display available tracks
async function fetchTracks() {
    const response = await fetch(`${API_URL}/tracks`);
    const data = await response.json();
    const tracks = data.tracks;
    const currentTrack = data.current_track;
    const loop = data.loop;

    const selectElement = document.getElementById('track-select');
    selectElement.innerHTML = ''; // Clear current options

    tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track;
        option.textContent = track;
        
        // Highlight the currently playing track
        if (track === currentTrack) {
            option.selected = true;
        }

        selectElement.appendChild(option);
    });

    // Update loop button text
    document.getElementById('loop-btn').textContent = loop ? 'Disable Loop' : 'Enable Loop';
}

// Function to play a selected track
async function playTrack() {
    const selectElement = document.getElementById('track-select');
    const track = selectElement.value;

    const response = await fetch(`${API_URL}/play`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ track })
    });
    const result = await response.json();
    console.log(result.message);
    fetchTracks();  // Update the list to reflect current playing track
}

// Function to stop playback
async function stopTrack() {
    const response = await fetch(`${API_URL}/stop`, {
        method: 'POST'
    });
    const result = await response.json();
    console.log(result.message);
    fetchTracks();  // Update the list after stopping
}

// Function to toggle loop mode
async function toggleLoop() {
    const response = await fetch(`${API_URL}/loop`, {
        method: 'POST'
    });
    const result = await response.json();
    console.log(result.message);
    fetchTracks();  // Update loop button after toggling
}

// Add event listeners to buttons
document.getElementById('play-btn').addEventListener('click', playTrack);
document.getElementById('stop-btn').addEventListener('click', stopTrack);
document.getElementById('loop-btn').addEventListener('click', toggleLoop);

// Fetch and display tracks when the page loads
fetchTracks();

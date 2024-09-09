// URL of the Flask API (adapt it to your server's URL)
const API_URL = 'http://localhost:5000';

// Function to fetch and display available tracks
async function fetchTracks() {
    try {
        const response = await fetch(`${API_URL}/tracks`);
        const data = await response.json();
        
        // Check if tracks are available
        if (Array.isArray(data.tracks)) {
            const selectElement = document.getElementById('track-select');
            selectElement.innerHTML = ''; // Clear current options

            data.tracks.forEach(track => {
                const option = document.createElement('option');
                option.value = track;
                option.textContent = track;
                
                // Highlight the currently playing track
                if (track === data.current_track) {
                    option.selected = true;
                }

                selectElement.appendChild(option);
            });

            // Update loop button text
            document.getElementById('loop-btn').textContent = data.loop ? 'Disable Loop' : 'Enable Loop';
        } else {
            console.error('Invalid tracks data received from API.');
        }
    } catch (error) {
        console.error('Error fetching tracks:', error);
    }
}

// Function to play a selected track
async function playTrack() {
    const selectElement = document.getElementById('track-select');
    const track = selectElement.value;

    try {
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
    } catch (error) {
        console.error('Error playing track:', error);
    }
}

// Function to stop playback
async function stopTrack() {
    try {
        const response = await fetch(`${API_URL}/stop`, {
            method: 'POST'
        });
        const result = await response.json();
        console.log(result.message);
        fetchTracks();  // Update the list after stopping
    } catch (error) {
        console.error('Error stopping track:', error);
    }
}

// Function to toggle loop mode
async function toggleLoop() {
    try {
        const response = await fetch(`${API_URL}/loop`, {
            method: 'POST'
        });
        const result = await response.json();
        console.log(result.message);
        fetchTracks();  // Update loop button after toggling
    } catch (error) {
        console.error('Error toggling loop:', error);
    }
}

// Add event listeners to buttons
document.getElementById('play-btn').addEventListener('click', playTrack);
document.getElementById('stop-btn').addEventListener('click', stopTrack);
document.getElementById('loop-btn').addEventListener('click', toggleLoop);

// Fetch and display tracks when the page loads
fetchTracks();

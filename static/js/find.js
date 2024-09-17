const APIController = (function() {
    
    const clientId = '1829a796453f4bee97ce990c04f0408c';
    const clientSecret = '739ba81260804a04890808ff64054b60';

    // private methods
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }
    
    const _searchTrack = async (token, query) => {
        const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token }
        });

        const data = await result.json();
        return data.tracks.items[0];
    }

    return {
        getToken() {
            return _getToken();
        },
        searchTrack(token, query) {
            return _searchTrack(token, query);
        }
    }
})();


// UI Module
const UIController = (function() {

    // object to hold references to html selectors
    const DOMElements = {
        inputArtist: '#artist_input',
        inputSong: '#song_input',
        buttonSubmit: '#search_button',
        divSongDetail: '#song_detail_section',
        hfToken: '#auth_token'
    }

    // public methods
    return {

        // method to get input fields
        inputField() {
            return {
                artist: document.querySelector(DOMElements.inputArtist),
                song: document.querySelector(DOMElements.inputSong),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // method to create the song detail
        createTrackDetail(img, title, artist, audio) {
            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            detailDiv.innerHTML = '';  // Clear previous results
            
            const audioSection = audio 
                ? `<audio controls>
                     <source src="${audio}" type="audio/mpeg">
                     Your browser does not support the audio element.
                   </audio>`
                : '<p>No preview available</p>';  // Display message if no preview
            
            const html = `
                <div class="row col-sm-12 px-0">
                    <img src="${img}" alt="Album cover" style="width: 100px; height: 100px;">
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="Genre" class="form-label col-sm-12">Title: ${title}</label>
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="artist" class="form-label col-sm-12">Artist: ${artist}</label>
                </div>
                <div class="row col-sm-12 px-0">
                    ${audioSection}
                </div>`;
            
            detailDiv.insertAdjacentHTML('beforeend', html);
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }
})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // create submit button click event listener
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        
        // get the artist and song input values
        const artist = DOMInputs.artist.value.trim();
        const song = DOMInputs.song.value.trim();
        
        if (!artist || !song) {
            alert('Please enter both artist name and song title.');
            return;
        }

        // get the token
        const token = UICtrl.getStoredToken().token;
        
        // search for the track
        const query = `${artist} ${song}`;
        const track = await APICtrl.searchTrack(token, query);
        
        if (!track) {
            alert('No song found. Please try again.');
            return;
        }

        // load the track details including the audio preview (if available)
        const img = track.album.images[1].url;
        const title = track.name;
        const trackArtist = track.artists[0].name;
        const audio = track.preview_url || ''; // Use preview URL, handle if not available

        // Add the track details to the UI
        UICtrl.createTrackDetail(img, title, trackArtist, audio);
    });

    return {
        init() {
            console.log('App is starting');
            // get the token on app start
            APICtrl.getToken().then(token => UICtrl.storeToken(token));
        }
    }

})(UIController, APIController);

// initialize the app
APPController.init();
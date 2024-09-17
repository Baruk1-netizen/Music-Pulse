const APIController = (function() {
    
    const clientId = '1829a796453f4bee97ce990c04f0408c';
    const clientSecret = '739ba81260804a04890808ff64054b60';

    // private methods
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getGenres = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {
        const limit = 50;
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {
        const limit = 50;
        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {
        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data;
    }

    const _searchTrack = async (token, query) => {
        const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data.tracks.items[0];
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        },
        searchTrack(token, query) {
            return _searchTrack(token, query);
        }
    }
})();

// UI Module
// UI Module
const UIController = (function() {

    // object to hold references to html selectors
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list',
        inputArtist: '#artist_input',
        inputSong: '#song_input',
        searchButton: '#search_button',
        divSearchSongDetail: '#song_detail_section',
        userPlaylist: '.user-playlist', // New for custom playlist
        addToPlaylistButton: '#add_to_playlist', // Button to add song to playlist
        viewPlaylistButton: '#view_playlist' // Button to view user's playlist
    }

    // public methods
    return {

        // method to get input fields
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail),
                artist: document.querySelector(DOMElements.inputArtist),
                song: document.querySelector(DOMElements.inputSong),
                searchButton: document.querySelector(DOMElements.searchButton),
                searchSongDetail: document.querySelector(DOMElements.divSearchSongDetail),
                addToPlaylistButton: document.querySelector(DOMElements.addToPlaylistButton),
                viewPlaylistButton: document.querySelector(DOMElements.viewPlaylistButton),
                userPlaylist: document.querySelector(DOMElements.userPlaylist)
            }
        },

        // method to create select list options
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        createTrackDetail(img, title, artist, audio, isSearch = false) {
            const detailDiv = isSearch ? document.querySelector(DOMElements.divSearchSongDetail) : document.querySelector(DOMElements.divSongDetail);
            detailDiv.innerHTML = ''; // Clear previous details

            const audioSection = audio 
                ? `<audio controls><source src="${audio}" type="audio/mpeg">Your browser does not support the audio element.</audio>`
                : '<p>No preview available</p>';

            const html = `
                <div class="row col-sm-12 px-0">
                    <img src="${img}" alt="Album cover" style="width: 100px; height: 100px;">
                </div>
                <div class="row col-sm-12 px-0">
                    <label class="form-label col-sm-12">Title: ${title}</label>
                </div>
                <div class="row col-sm-12 px-0">
                    <label class="form-label col-sm-12">Artist: ${artist}</label>
                </div>
                <div class="row col-sm-12 px-0">
                    ${audioSection}
                </div>`;

            detailDiv.insertAdjacentHTML('beforeend', html);
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        },

        // New: Add song to the user's custom playlist
        addSongToUserPlaylist(trackName) {
            const html = `<li class="list-group-item">${trackName}</li>`;
            document.querySelector(DOMElements.userPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // New: Reset user's custom playlist
        resetUserPlaylist() {
            this.inputField().userPlaylist.innerHTML = '';
        }
    }
})();

const APPController = (function(UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();
    let userPlaylist = []; // New: Store the user's custom playlist

    const loadGenres = async () => {
        const token = await APICtrl.getToken();
        UICtrl.storeToken(token);
        const genres = await APICtrl.getGenres(token);
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    DOMInputs.genre.addEventListener('change', async () => {
        UICtrl.resetPlaylist();
        const token = UICtrl.getStoredToken().token;
        const genreId = DOMInputs.genre.value;
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
    });

    DOMInputs.submit.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTracks();
        const token = UICtrl.getStoredToken().token;
        const tracksEndPoint = DOMInputs.playlist.value;
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name));
    });

    DOMInputs.tracks.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTrackDetail();
        const token = UICtrl.getStoredToken().token;
        const trackEndpoint = e.target.id;
        const track = await APICtrl.getTrack(token, trackEndpoint);
        const img = track.album.images[2].url;
        const title = track.name;
        const artist = track.artists[0].name;
        const audio = track.preview_url || '';
        UICtrl.createTrackDetail(img, title, artist, audio);

        // Enable the "Add to Playlist" button for the selected track
        DOMInputs.addToPlaylistButton.disabled = false;
        DOMInputs.addToPlaylistButton.dataset.trackName = title;
    });

    // New: Add selected song to the user's playlist
    DOMInputs.addToPlaylistButton.addEventListener('click', (e) => {
        e.preventDefault();
        const trackName = e.target.dataset.trackName;
        if (trackName) {
            userPlaylist.push(trackName);
            UICtrl.addSongToUserPlaylist(trackName);
        }
    });

    // // New: View the user's custom playlist
    // DOMInputs.viewPlaylistButton.addEventListener('click', () => {
    //     alert(`Your Playlist: \n${userPlaylist.join('\n')}`);
    // });

    DOMInputs.searchButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const artist = DOMInputs.artist.value.trim();
        const song = DOMInputs.song.value.trim();
        if (!artist || !song) {
            alert('Please enter both artist name and song title.');
            return;
        }

        const token = UICtrl.getStoredToken().token;
        const query = `${artist} ${song}`;
        const track = await APICtrl.searchTrack(token, query);
        if (!track) {
            alert('No song found. Please try again.');
            return;
        }

        const img = track.album.images[2].url;
        const title = track.name;
        const artistName = track.artists[0].name;
        const audio = track.preview_url || '';
        UICtrl.createTrackDetail(img, title, artistName, audio, true);

        // Enable the "Add to Playlist" button for the searched track
        DOMInputs.addToPlaylistButton.disabled = false;
        DOMInputs.addToPlaylistButton.dataset.trackName = title;
    });

    return {
        init() {
            loadGenres();
        }
    }

})(UIController, APIController);

APPController.init();

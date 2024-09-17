    // Scroll function to move left
    function scrollLeft(containerId) {
        const container = document.getElementById(containerId);
        container.scrollBy({ left: -300, behavior: 'smooth' });
    }

    // Scroll function to move right
    function scrollRight(containerId) {
        const container = document.getElementById(containerId);
        container.scrollBy({ left: 300, behavior: 'smooth' });
    }






const APIController = (function() {
    const clientId = '1829a796453f4bee97ce990c04f0408c';
    const clientSecret = '739ba81260804a04890808ff64054b60';

    // Fetch Token
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials',
        });
        const data = await result.json();
        return data.access_token;
    };

    // Fetch trending songs (new releases)
    const _getTrendingSongs = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/new-releases`, {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + token },
        });
        const data = await result.json();
        return data.albums.items;
    };

    // Fetch popular playlists
    const _getPopularPlaylists = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/featured-playlists`, {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + token },
        });
        const data = await result.json();
        return data.playlists.items;
    };

    return {
        getToken() {
            return _getToken();
        },
        getTrendingSongs(token) {
            return _getTrendingSongs(token);
        },
        getPopularPlaylists(token) {
            return _getPopularPlaylists(token);
        },
    };
})();

const UIController = (function() {
    const DOMElements = {
        trendingSongsDiv: '#trending-songs',
        popularPlaylistsDiv: '#popular-playlists',
    };

    // Create scrollable cards for trending songs
    const createSongCard = (img, title, artist) => {
        return `
        <div class="card" style="width: 150px; margin: 10px;">
            <img src="${img}" class="card-img-top" style="width: 100%; height: 100px;">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${artist}</p>
            </div>
        </div>`;
    };

    // Create scrollable cards for playlists
    const createPlaylistCard = (img, title) => {
        return `
        <div class="card" style="width: 150px; margin: 10px;">
            <img src="${img}" class="card-img-top" style="width: 100%; height: 100px;">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
            </div>
        </div>`;
    };

    return {
        // Render trending songs
        renderTrendingSongs(songs) {
            const container = document.querySelector(DOMElements.trendingSongsDiv);
            container.innerHTML = ''; // Clear the container
            songs.forEach(song => {
                const html = createSongCard(song.images[1].url, song.name, song.artists[0].name);
                container.insertAdjacentHTML('beforeend', html);
            });
        },

        // Render popular playlists
        renderPopularPlaylists(playlists) {
            const container = document.querySelector(DOMElements.popularPlaylistsDiv);
            container.innerHTML = ''; // Clear the container
            playlists.forEach(playlist => {
                const html = createPlaylistCard(playlist.images[0].url, playlist.name);
                container.insertAdjacentHTML('beforeend', html);
            });
        },
    };
})();

const APPController = (function(UICtrl, APICtrl) {
    const loadTrendingAndPopular = async () => {
        // Get token
        const token = await APICtrl.getToken();

        // Get trending songs
        const trendingSongs = await APICtrl.getTrendingSongs(token);
        UICtrl.renderTrendingSongs(trendingSongs);

        // Get popular playlists
        const popularPlaylists = await APICtrl.getPopularPlaylists(token);
        UICtrl.renderPopularPlaylists(popularPlaylists);
    };

    return {
        init() {
            console.log('App starting');
            loadTrendingAndPopular();
        },
    };
})(UIController, APIController);

// Start the app
APPController.init();


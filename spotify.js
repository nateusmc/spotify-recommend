'use strict';

const CLIENT_ID = 'e124343d7c1149fa902c18b386fd426f';

const getFromApi = function (endpoint, query = {}) {

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;

const getArtist = function (name) {
  const searchEndpoint = 'search';
  let querys = {
    q: name,
    limit: 1,
    type: 'artist'
  };
  
  return getFromApi(searchEndpoint, querys)
    .then (item => {
      console.log('.then 1', item);
      artist = item.artists.items[0];
      let artistId = item.artists.items[0].id;
      return getFromApi(`artists/${artistId}/related-artists`);
    }).then(item => {
      console.log('.then 2', item.artists);
      artist.related = item.artists;
      console.log('.then 3', artist);
      const tracksArr = [];
      for (let i = 0; i < artist.related.length; i++) {
        let trackId = artist.related[i].id;
        tracksArr.push(getFromApi(`artists/${trackId}/top-tracks?country=US`));
      }
      let allPromise = Promise.all(tracksArr);
      return allPromise.then(response => {
        console.log(response);
        for (let i =0; i < response.length; i++) {
          artist.related[i].tracks = response[i].tracks;
        }
        return artist;
      });
    }).catch(err => {
      console.error('Catch Hit!', err);
    });
};

const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
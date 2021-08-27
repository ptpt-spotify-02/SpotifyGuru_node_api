import SpotifyWebAPI from 'spotify-web-api-node';
import PromiseThrottle from 'promise-throttle';

let spotifyAPI = null;
let spotifyPromise = null;
let spotifyCredentialsExpire = Date.now();
// eslint-disable-next-line consistent-return
const updateCredentials = async () => {
  if (spotifyPromise !== null)
    return spotifyPromise;

  if (spotifyCredentialsExpire > (Date.now() + 100))
    // eslint-disable-next-line consistent-return
    return;

  spotifyAPI = new SpotifyWebAPI({
    clientId    : process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  });

  spotifyPromise = spotifyAPI.clientCredentialsGrant().finally(() => {
    spotifyPromise = null;
  });

  let data = null;
  try {
    data = (await spotifyPromise).body;
  } catch (error) {
    console.error('Error while getting spotify credentials!');
    console.error(error);

    // eslint-disable-next-line consistent-return
    return;
  }

  // eslint-disable-next-line quote-props
  const { 'expires_in' : expiresIn, 'access_token' : accessToken } = data;
  console.info(`New spotify credentials expire in ${expiresIn} seconds`);
  spotifyCredentialsExpire = Date.now + (expiresIn * 1000);
  spotifyAPI.setAccessToken(accessToken);
};

const getAristString = (artists) => {
  if (artists.length === 0)
    return '';

  const str = artists.shift().name;
  const sep = artists.length === 0 ? '' : artists.length === 1 ? ' & ' : ', ';

  return str + sep + getAristString(artists);
};

const getAlbumLink = (albumLinks) => {
  if (albumLinks.length === 0)
    return '';

  return albumLinks.reduce((biggest, album) => {
    if (album.width > biggest.width)
      return album;

    return biggest;
  }, albumLinks.shift()).url;
};

const convertTrackData = (track) => {
  return {
    spotifyID     : track.id,
    title         : track.name,
    author        : getAristString(track.artists),
    album         : track.album.name,
    albumImageLink: getAlbumLink(track.album.images),
    audioLink     : track.external_urls.spotify,
    // eslint-disable-next-line dot-notation
    year          : new Date(track.album['release_date']).getFullYear()
  };
};

const convertStatData = (stats) => {
  return {
    spotifyID       : stats.id,
    acousticness    : stats.acousticness,
    danceability    : stats.danceability,
    energy          : stats.energy,
    instrumentalness: stats.instrumentalness,
    key             : stats.key,
    liveness        : stats.liveness,
    loudness        : stats.loudness,
    mode            : stats.mode,
    speechiness     : stats.speechiness,
    tempo           : stats.tempo,
    valence         : stats.valence
  };
};

const throttle = new PromiseThrottle({
  requestsPerSecond    : 10,
  promiseImplementation: Promise
});

export const getTrackInfo = async (tracks) => {
  await updateCredentials();
  const res = await throttle.add(() => spotifyAPI.getTracks(tracks));

  return res.body.tracks.map(convertTrackData);
};

export const getTrackStats = async (tracks) => {
  await updateCredentials();
  const res = await throttle.add(() => spotifyAPI.getAudioFeaturesForTracks(tracks));

  // eslint-disable-next-line dot-notation
  return res.body['audio_features'].map(convertStatData);
};

export const searchTracks = async (query) => {
  await updateCredentials();
  const res = await throttle.add(() => spotifyAPI.searchTracks(query));

  return res.body.tracks.items.map(convertTrackData);
};

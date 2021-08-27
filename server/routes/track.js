import HttpStatus from 'http-status';
import Router from 'koa-router';

import { Song } from '../models';
import { getTrackInfo, getTrackStats } from '../spotify';

const router = new Router();

router.post('/track', async (ctx, next) => {
  const body = ctx.request.body;

  if (typeof body !== 'object' || !Array.isArray(body.tracks) || body.tracks.reduce((i) => typeof i === 'string', false)) {
    ctx.status = HttpStatus.BAD_REQUEST;
    ctx.body = 'Expected <tracks> to be a list of spotifyIDs in request body';
    await next();

    return;
  }

  const { tracks } = body;

  if (tracks.length > process.env.MAX_TRACKS) {
    ctx.status = HttpStatus.BAD_REQUEST;
    ctx.body = 'Number of tracks exceeds limit.';
    await next();

    return;
  }

  const trackObj = {};

  const knownTracks = await Song.find({ spotifyID: { $in: tracks }});
  const unknownTracks = tracks.filter((id) => !knownTracks.find((track) => track.spotifyID === id));

  for (const track of knownTracks)
    trackObj[track.spotifyID] = track;

  if (unknownTracks.length > 0) {
    const unknownInfoPromise = getTrackInfo(unknownTracks);
    const unknownStatsPromise = getTrackStats(unknownTracks);
    const unknownSongs = [];

    const unknownInfo = await unknownInfoPromise;
    for (const trackInfo of unknownInfo) {
      trackObj[trackInfo.spotifyID] = trackInfo;
      unknownSongs.push(trackObj[trackInfo.spotifyID]);
    }

    const unknownStats = await unknownStatsPromise;
    for (const trackStats of unknownStats) {
      trackObj[trackStats.spotifyID].stats = trackStats;
      delete trackStats.spotifyID;
    }

    // We don't need to await since it can happen in the background
    Song.insertMany(unknownSongs);
  }

  // return the tracks in the same order
  const returnTracks = tracks.map((id) => trackObj[id]);

  ctx.status = HttpStatus.OK;
  ctx.body = { tracks: returnTracks };

  await next();
});

export default router;

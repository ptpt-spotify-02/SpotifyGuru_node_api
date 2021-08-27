import axios from 'axios';

import HttpStatus from 'http-status';
import Router from 'koa-router';

const router = new Router();

router.get('/suggestions', async (ctx, next) => {
  let number = null;
  const spotifyID = ctx.query.spotifyID;

  try {
    number = ctx.query.number ? Number.parseInt(ctx.query.number) : 10;
  } catch (error) {
    ctx.status = HttpStatus.BAD_REQUEST;
    ctx.body = 'Expected number to be an integer!';
  }

  if (typeof number !== 'number') {
    ctx.status = HttpStatus.BAD_REQUEST;
    ctx.body = 'Expected number to be an integer!';

    return;
  }

  if (typeof spotifyID !== 'string' || spotifyID.trim().length === 0) {
    ctx.status = HttpStatus.BAD_REQUEST;
    ctx.body = 'Expected a valid spotifyID!';

    return;
  }

  let suggestions = null;
  try {
    const songData = (await axios.post('http://localhost:5000/track', { tracks: [spotifyID] })).data.tracks[0];
    console.log('songData', songData);
    const suggestionIDs = (await axios.post(`${process.env.PYTHON_API_URI}/suggestions?number=${number}`, songData)).data;
    console.log('suggestionIDs', suggestionIDs);
    suggestions = (await axios.post('http://localhost:5000/track', { tracks: suggestionIDs })).data.tracks;
  } catch (error) {
    ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
    ctx.body = error;

    return;
  }

  ctx.status = HttpStatus.OK;
  ctx.body = suggestions;

  await next();
});

export default router;

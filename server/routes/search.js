import HttpStatus from 'http-status';
import Router from 'koa-router';

import { searchTracks } from '../spotify';

const router = new Router();

router.get('/search', async (ctx, next) => {
  const { query } = ctx.request.query;

  if (typeof query !== 'string' || query.length < 3) {
    ctx.status = HttpStatus.BAD_REQUEST;
    ctx.body = 'Expected query to be a string of at least 3 characters!';

    return;
  }

  const tracks = await searchTracks(query);
  ctx.status = HttpStatus.OK;
  ctx.body = tracks;

  await next();
});

export default router;

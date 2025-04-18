'use strict';
import v1 from './v1'
import v2 from './v2'
import v3 from './v3'
import v4 from './v4'
import bos from './bos'
import shopping from './shopping'
import promotion from './promotion'
export default app => {
  app.use('/v1', v1)
  app.use('/v2', v2)
  app.use('/v3', v3)
  app.use('/v4', v4)
  app.use('/shopping', shopping)
  app.use('/bos', bos)
  app.use('/promotion', promotion);
}


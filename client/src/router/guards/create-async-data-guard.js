/* eslint import/prefer-default-export: 0 */
/* eslint arrow-parens: 0 */
/* eslint no-console: 0 */

export const createAsyncDataGuard = ({ store, router }) => async (to, from, next) => {
  const { $progress } = router.app;
  const matched = router.getMatchedComponents(to);
  const prevMatched = router.getMatchedComponents(from);
  let diffed = false;

  const activated = matched.filter((c, i) => {
    const isActivated = diffed || (diffed = (prevMatched[i] !== c));
    return isActivated;
  });

  if (!activated.length) {
    // push last match for loading asyncData
    activated.push(matched[matched.length - 1]);
  }

  const asyncDataHooks = [router.app.$options, ...activated]
    .filter(_ => _)
    .map(c => c.asyncData)
    .filter(_ => _);

  if (!asyncDataHooks.length) {
    // setTimeout(app.$progress.done, 150); // Hack bar - when hooks is sync
    next();
    // store.dispatch('cleanErrorResponse');
    return;
  }

  if ($progress.show && $progress.progress === 100) {
    let unwatch;
    await new Promise(resolve => {
      unwatch = $progress.$watch('show', resolve);
    });
    unwatch();
  }

  $progress.start();

  try {
    const hooks = asyncDataHooks
      .map(hook => hook({ store, router, route: to }))
      .filter(_ => _);

    await Promise.all(hooks);
    setTimeout($progress.done, 150); // Hack bar - when hooks is sync
    next();
    // store.dispatch('cleanErrorResponse');
  } catch (error) {
    $progress.fail();
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Error while asyncData:');
      console.error(error);
    }

    // Refresh token not found
    if ([104, 401].includes(error.code)) {
      next({ name: 'logout' });
    } else {
      // Set to App error layout
      store.dispatch('setErrorResponse', error);
      next();
    }
  }
};

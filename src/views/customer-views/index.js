import React, { lazy, Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import Loading from 'components/shared-components/Loading';

export const AppViews = ({match}) => {
  return (
    <Suspense fallback={<Loading cover="page"/>}>
      <Switch>
        <Route path={`${match.url}/privacy-policy`} component={lazy(() => import(`./privacy`))} />
        <Route path={`${match.url}/:id`} component={lazy(() => import(`./review`))} />
        <Route path={`${match.url}/404`} component={lazy(() => import(`../auth-views/errors/error-page-1`))} />
        <Route path={`${match.url}/error`} component={lazy(() => import(`../auth-views/errors/error-page-2`))} />
      </Switch>
    </Suspense>
  )
}

export default AppViews;


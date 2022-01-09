import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from 'components/shared-components/Loading';

const Districts = ({ match }) => (
  <Suspense fallback={<Loading cover="content"/>}>
    <Switch>
      <Route path={`${match.url}/list`} component={lazy(() => import(`./list`))} />
      <Route path={`${match.url}/add`} component={lazy(() => import(`./add`))} />
      <Route path={`${match.url}/edit/:id`} component={lazy(() => import(`./edit`))} />
      <Redirect exact from={`${match.url}`} to={`${match.url}/list`} />
    </Switch>
  </Suspense>
);

export default Districts;

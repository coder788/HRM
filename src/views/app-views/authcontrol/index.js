import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from 'components/shared-components/Loading';

const Staff = ({ match }) => (
  <Suspense fallback={<Loading cover="content"/>}>
    <Switch>
      <Route path={`${match.url}/:id`} component={lazy(() => import(`./form`))} />
      <Redirect exact from={`${match.url}`} to={`${match.url}/role/1`} />
    </Switch>
  </Suspense>
);

export default Staff;

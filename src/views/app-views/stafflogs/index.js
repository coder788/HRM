import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from 'components/shared-components/Loading';

const StaffLogs = ({ match }) => (
  <Suspense fallback={<Loading cover="content"/>}>
    <Switch>
      <Route path={`${match.url}/list`} component={lazy(() => import(`./list`))} />
      <Redirect exact from={`${match.url}`} to={`${match.url}/list`} />
    </Switch>
  </Suspense>
);

export default StaffLogs;

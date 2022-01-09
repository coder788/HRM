import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from "components/shared-components/Loading";

export const AppViews = ({ match }) => {
  return (
    <Suspense fallback={<Loading cover="content" />}>
      <Switch>
        <Route
          path={`${match.url}/dashboard`}
          component={lazy(() => import(`./home`))}
        />
        <Route
          path={`${match.url}/tickets`}
          component={lazy(() => import(`./tickets`))}
        />
        {/* <Route path={`${match.url}/mission/sheet`} component={lazy(() => import(`./tickets/assign`))} /> */}
        <Route
          path={`${match.url}/employee`}
          component={lazy(() => import(`./staff`))}
        />
        <Route
          path={`${match.url}/departments`}
          component={lazy(() => import(`./departments`))}
        />

        <Route
          path={`${match.url}/authcontrol`}
          component={lazy(() => import(`./authcontrol`))}
        />
        <Route
          path={`${match.url}/customers`}
          component={lazy(() => import(`./customers`))}
        />
        <Route
          path={`${match.url}/stock`}
          component={lazy(() => import(`./stock`))}
        />
        {/* <Route
          path={`${match.url}/districts`}
          component={lazy(() => import(`./districts`))}
        />
        <Route
          path={`${match.url}/zones`}
          component={lazy(() => import(`./zones`))}
        /> */}
        {/* <Route path={`${match.url}/vehicles`} component={lazy(() => import(`./vehicles`))} />
        <Route path={`${match.url}/equipments`} component={lazy(() => import(`./equipments`))} /> */}
        <Route
          path={`${match.url}/chat/:id`}
          component={lazy(() => import(`./chat`))}
        />
        <Route
          path={`${match.url}/chat`}
          component={lazy(() => import(`./chat`))}
        />
        {/* <Route
          path={`${match.url}/newsletter`}
          component={lazy(() => import(`./newsletter`))}
        /> */}
        {/* <Route path={`${match.url}/stafflogs`} component={lazy(() => import(`./stafflogs`))} /> */}
        <Route
          path={`${match.url}/settings`}
          component={lazy(() => import(`./settings`))}
        />
        {/* <Route path={`${match.url}/reports/staff`} component={lazy(() => import(`./reports/staff`))} /> */}
        {/* <Route path={`${match.url}/reports/customers`} component={lazy(() => import(`./reports/customers`))} /> */}
        <Route
          path={`${match.url}/reports/tickets`}
          component={lazy(() => import(`./reports/tickets`))}
        />
        {/* <Route path={`${match.url}/reports/stock`} component={lazy(() => import(`./reports/stock`))} /> */}
        <Route
          path={`${match.url}/interactive`}
          component={lazy(() => import(`./interactive`))}
        />
        <Route
          path={`${match.url}/404`}
          component={lazy(() => import(`../auth-views/errors/error-page-1`))}
        />
        <Route
          path={`${match.url}/error`}
          component={lazy(() => import(`../auth-views/errors/error-page-2`))}
        />
        <Redirect from={`${match.url}`} to={`${match.url}/dashboard`} />
      </Switch>
    </Suspense>
  );
};

export default AppViews;

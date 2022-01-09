import React from 'react'
import { Switch, Route, } from "react-router-dom";
import AuthViews from 'views/customer-views'

export const CustomerLayout = () => {
	return (
		<div className="auth-container">
			<Switch>
				<Route path="" component={AuthViews} />
			</Switch>
		</div>
	)
}

export default CustomerLayout

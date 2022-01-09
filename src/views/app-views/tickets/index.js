import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom';
import TicketList from './list/TicketList';
import NewTicketForm from './new';
import ViewTicket from './view';
import AssignTicket from './assign';

const Tickets = ({ match }) => {
	return (
			<Switch>
				<Redirect exact from={`${match.url}`} to={`${match.url}/list`} />
				<Route path={`${match.url}/list`} component={TicketList} />
				<Route path={`${match.url}/new`} component={NewTicketForm} />
				<Route path={`${match.url}/edit/:id`} component={NewTicketForm} />
				<Route path={`${match.url}/view/:id`} component={ViewTicket} />
				<Route path={`${match.url}/assign/:type/:id`} component={AssignTicket} />
			</Switch>
	)
}

export default Tickets


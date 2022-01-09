import fetch from "auth/FetchInterceptor";

const apiService = {};

//===========Tickets==========

apiService.getTickets = function (params) {
  let query = params
    ? Object.keys(params)
        .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
        .join("&")
    : "";
  return fetch({
    url: `tickets/list?${query}`,
    method: "get",
  });
};

apiService.getTicket = function (id) {
  return fetch({
    url: `tickets/view/${id}`,
    method: "get",
  });
};

apiService.printTicket = function (id) {
  return fetch({
    url: `tickets/print/${id}`,
    method: "get",
  });
};

apiService.addTicket = function (params) {
  return fetch({
    url: `tickets/create`,
    method: "post",
    data: params,
  });
};

apiService.updateTicket = function (params) {
  return fetch({
    url: `tickets/update`,
    method: "post",
    data: params,
  });
};

apiService.getTicketActions = function (params) {
  return fetch({
    url: `tickets/actions/list`,
    method: "post",
    data: params,
  });
};

apiService.rescheduleFeedback = function (ticketid, params) {
  return fetch({
    url: `tickets/reschedule_feedback/${ticketid}`,
    method: "post",
    data: params,
  });
};

apiService.assignMission = function (action, params) {
  return fetch({
    url: `tickets/actions/${action}`,
    method: "post",
    data: params,
  });
};

apiService.staffAvailability = function (params) {
  return fetch({
    url: `tickets/actions/staff_availability`,
    method: "post",
    data: params,
  });
};

apiService.raiseProblem = function (action, ticketid, params) {
  return fetch({
    url: `tickets/actions/${action}/raise_problem/${ticketid}`,
    method: "post",
    data: params,
  });
};

apiService.sendQCReport = function (ticket_id, params) {
  return fetch({
    url: `tickets/actions/qc/send_report/${ticket_id}`,
    method: "post",
    data: params,
  });
};

apiService.delTicket = function (id) {
  return fetch({
    url: `tickets/delete/${id}`,
    method: "get",
  });
};

apiService.delTicketAction = function (id) {
  return fetch({
    url: `tickets/actions/delete/${id}`,
    method: "get",
  });
};

//===========Customers==========

apiService.searchCustomers = function (query) {
  return fetch({
    url: `customers/list?query=${query}`,
    method: "get",
  });
};

apiService.getCustomers = function (params) {
  return fetch({
    url: "customers/list",
    method: "get",
    params,
  });
};

apiService.getCustomer = function (profileid) {
  return fetch({
    url: "customers/profile/" + profileid,
    method: "get",
  });
};

apiService.deleteCustomer = function (profileid) {
  return fetch({
    url: "customers/delete/" + profileid,
    method: "get",
  });
};

apiService.createCustomer = function (params) {
  return fetch({
    url: "customers/create",
    method: "post",
    data: params,
  });
};

apiService.updateCustomer = function (params) {
  return fetch({
    url: "customers/update",
    method: "post",
    data: params,
  });
};

apiService.sendCustomerSMS = function (params) {
  return fetch({
    url: "customers/sms",
    method: "post",
    data: params,
  });
};

//===========Users==========

apiService.getUsers = function (params) {
  return fetch({
    url: "user/list",
    method: "get",
    params,
  });
};

apiService.getProfile = function () {
  return fetch({
    url: "user/profile/me",
    method: "get",
  });
};

apiService.reloadSettings = function () {
  return fetch({
    url: "login",
    method: "get",
  });
};

apiService.getNotifications = function (page, limit) {
  return fetch({
    url: `user/notifications?page=${page}&pages_info=1&limit=${limit}`,
    method: "get",
  });
};

apiService.notifsMarkAllRead = function () {
  return fetch({
    url: "user/notifications/markread",
    method: "get",
  });
};

apiService.notifsDeleteAll = function () {
  return fetch({
    url: "user/notifications/delete",
    method: "get",
  });
};

apiService.getLogs = function (params) {
  return fetch({
    url: "user/logs",
    method: "get",
    params,
  });
};

apiService.updateUser = function (params) {
  return fetch({
    url: "user/update",
    method: "post",
    data: params,
  });
};

apiService.updateMyProfile = function (params) {
  return fetch({
    url: "user/myprofile",
    method: "post",
    data: params,
  });
};

apiService.createUser = function (params) {
  return fetch({
    url: "user/create",
    method: "post",
    data: params,
  });
};

apiService.updateUserPass = function (params) {
  return fetch({
    url: "user/password",
    method: "post",
    data: params,
  });
};

apiService.updateMyPass = function (params) {
  return fetch({
    url: "user/mypassword",
    method: "post",
    data: params,
  });
};

apiService.updateUserSettings = function (params) {
  return fetch({
    url: "user/settings",
    method: "post",
    data: params,
  });
};

apiService.updateMySettings = function (params) {
  return fetch({
    url: "user/mysettings",
    method: "post",
    data: params,
  });
};

apiService.updateUserPermissions = function (params) {
  return fetch({
    url: "user/permissions",
    method: "post",
    data: params,
  });
};

apiService.getUser = function (profileid) {
  return fetch({
    url: "user/profile/" + profileid,
    method: "get",
  });
};

apiService.gpsHistory = function () {
  return fetch({
    url: "user/gps_history",
    method: "get",
  });
};

apiService.delUser = function (profileid) {
  return fetch({
    url: "user/delete/" + profileid,
    method: "get",
  });
};

//===========Stock==========

apiService.createStock = function (params) {
  return fetch({
    url: "stock/create",
    method: "post",
    data: params,
  });
};

apiService.updateStock = function (params) {
  return fetch({
    url: "stock/update",
    method: "post",
    data: params,
  });
};

apiService.getStock = function (params) {
  return fetch({
    url: "stock/list",
    method: "get",
    params,
  });
};

apiService.getStockData = function (id) {
  return fetch({
    url: `stock/view/${id}`,
    method: "get",
  });
};

apiService.deleteStock = function (id) {
  return fetch({
    url: `stock/delete/${id}`,
    method: "get",
  });
};

//===========Vehicles==========

apiService.createVehicle = function (params) {
  return fetch({
    url: "vehicles/create",
    method: "post",
    data: params,
  });
};

apiService.updateVehicle = function (params) {
  return fetch({
    url: "vehicles/update",
    method: "post",
    data: params,
  });
};

apiService.getVehicles = function (params) {
  return fetch({
    url: "vehicles/list",
    method: "get",
    params,
  });
};

apiService.getVehicleData = function (id) {
  return fetch({
    url: `vehicles/view/${id}`,
    method: "get",
  });
};

apiService.deleteVehicle = function (id) {
  return fetch({
    url: `vehicles/delete/${id}`,
    method: "get",
  });
};

//===========Equipments==========

apiService.createEquipment = function (params) {
  return fetch({
    url: "equipments/create",
    method: "post",
    data: params,
  });
};

apiService.updateEquipment = function (params) {
  return fetch({
    url: "equipments/update",
    method: "post",
    data: params,
  });
};

apiService.getEquipments = function (params) {
  return fetch({
    url: "equipments/list",
    method: "get",
    params,
  });
};

apiService.getEquipmentData = function (id) {
  return fetch({
    url: `equipments/view/${id}`,
    method: "get",
  });
};

apiService.deleteEquipment = function (id) {
  return fetch({
    url: `equipments/delete/${id}`,
    method: "get",
  });
};

//===========Districts==========
apiService.createDistrict = function (params) {
  return fetch({
    url: "districts/create",
    method: "post",
    data: params,
  });
};

apiService.updateDistrict = function (params) {
  return fetch({
    url: "districts/update",
    method: "post",
    data: params,
  });
};

apiService.getDistricts = function (params) {
  return fetch({
    url: "districts/list",
    method: "get",
    params,
  });
};

apiService.getDistrict = function (id) {
  return fetch({
    url: `districts/view/${id}`,
    method: "get",
  });
};

apiService.deleteDistrict = function (id) {
  return fetch({
    url: `districts/delete/${id}`,
    method: "get",
  });
};

//===========Zones==========
apiService.createZone = function (params) {
  return fetch({
    url: "zones/create",
    method: "post",
    data: params,
  });
};

apiService.updateZone = function (params) {
  return fetch({
    url: "zones/update",
    method: "post",
    data: params,
  });
};

apiService.getZones = function (params) {
  return fetch({
    url: "zones/list",
    method: "get",
    params,
  });
};

apiService.getZone = function (id) {
  return fetch({
    url: `zones/view/${id}`,
    method: "get",
  });
};

apiService.deleteZone = function (id) {
  return fetch({
    url: `zones/delete/${id}`,
    method: "get",
  });
};

//===========Chat==========
apiService.sendMessage = function (params) {
  return fetch({
    url: "chat/new_message",
    method: "post",
    data: params,
  });
};

apiService.archiveChat = function (id) {
  return fetch({
    url: `chat/archive/${id}`,
    method: "get",
  });
};

apiService.inboxChat = function (id) {
  return fetch({
    url: `chat/inbox/${id}`,
    method: "get",
  });
};

apiService.getChats = function (page, query) {
  return fetch({
    url: `chat/list?page=${page}&query=${query}`,
    method: "get",
  });
};

apiService.getChatMessages = function (id, lstid) {
  return fetch({
    url: `chat/view/${id}?last_id=${lstid}`,
    method: "get",
  });
};

apiService.deleteChat = function (id) {
  return fetch({
    url: `chat/delete/${id}`,
    method: "get",
  });
};

//===========Settings==========

apiService.getSystemModules = function (profileid) {
  return fetch({
    url: `settings/system_modules?profileid=${profileid}`,
    method: "get",
  });
};

apiService.getSettings = function () {
  return fetch({
    url: `settings/list`,
    method: "get",
  });
};

apiService.updateSettings = function (params) {
  return fetch({
    url: "settings/update",
    method: "post",
    data: params,
  });
};

//===========Auth Control==========

apiService.getRoleTemplate = function (role_id) {
  return fetch({
    url: `auth_control/get_permissions?role_id=${role_id}`,
    method: "get",
  });
};

apiService.updateRolePerms = function (params) {
  return fetch({
    url: "auth_control/update_permissions",
    method: "post",
    data: params,
  });
};

apiService.updatePermsToAll = function (role_id) {
  return fetch({
    url: `auth_control/apply_to_all?role_id=${role_id}`,
    method: "get",
  });
};

//===========Tickets Categories==========

apiService.ticketsCategories = function () {
  return fetch({
    url: "tickets/categories/list",
    method: "get",
  });
};

apiService.ticketsCategoriesCreate = function (params) {
  return fetch({
    url: "tickets/categories/create",
    method: "post",
    data: params,
  });
};

//===========Stock Categories==========

apiService.stockCategories = function () {
  return fetch({
    url: "stock/categories/list",
    method: "get",
  });
};

apiService.stockCategoriesCreate = function (params) {
  return fetch({
    url: "stock/categories/create",
    method: "post",
    data: params,
  });
};

//===========Reports==========

apiService.getReports = function (module, params) {
  return fetch({
    url: `reports/${module}`,
    method: "get",
    params,
  });
};

apiService.exportReports = function (module, params) {
  return fetch({
    url: `reports/${module}/export`,
    method: "get",
    responseType: "blob",
    params,
  });
};

apiService.exportSummary = function (module, params) {
  return fetch({
    url: `reports/${module}/summary`,
    method: "get",
    responseType: "blob",
    params,
  });
};
//==========Departments============

apiService.getDepartments = function (params) {
  return fetch({
    url: "categories/list",
    method: "get",
    params,
  });
};

apiService.CreateDepartments = function (params) {
  return fetch({
    url: "categories/create",
    method: "post",
    params,
  });
};

apiService.delDepartments = function (departID) {
  return fetch({
    url: "categories/delete/" + departID,
    method: "dselete",
  });
};

export default apiService;

import {
  DashboardOutlined,
  TeamOutlined,
  TagsOutlined,
  SettingOutlined,
  PieChartOutlined,
  MessageOutlined,
  AreaChartOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { CAN_VIEW_MODULE } from "./AppConfig";

let dashBoardNavTree = [
  {
    key: "dashboard",
    path: "/app/dashboard",
    title: "sidenav.dashboard",
    icon: DashboardOutlined,
    breadcrumb: false,
    submenu: [
      {
        key: "dashboard-default",
        path: "/app/dashboard",
        title: "sidenav.dashboard.default",
        icon: DashboardOutlined,
        breadcrumb: false,
        submenu: [],
      },
    ],
  },
];

if (CAN_VIEW_MODULE(1)) {
  dashBoardNavTree[0].submenu.push({
    key: "dashboard-settings",
    path: "/app/settings",
    title: "sidenav.dashboard.settings",
    icon: SettingOutlined,
    breadcrumb: false,
    submenu: [],
  });
}
if (CAN_VIEW_MODULE(5)) {
  dashBoardNavTree[0].submenu.push({
    key: "dashboard-employee",
    path: "/app/employee/list",
    title: "sidenav.employee",
    icon: TeamOutlined,
    breadcrumb: true,
    submenu: [],
  });
}
if (CAN_VIEW_MODULE(138)) {
  dashBoardNavTree[0].submenu.push({
    key: "dashboard-auth-control",
    path: "/app/authcontrol",
    title: "sidenav.auth",
    icon: KeyOutlined,
    breadcrumb: true,
    submenu: [],
  });
}
if (CAN_VIEW_MODULE(138)) {
  dashBoardNavTree[0].submenu.push({
    key: "dashboard-department-control",
    path: "/app/departments",
    title: "sidenav.department",
    icon: KeyOutlined,
    breadcrumb: true,
    submenu: [],
  });
}

// if (CAN_VIEW_MODULE(10)) {
//   dashBoardNavTree[0].submenu.push({
//     key: "dashboard-districts",
//     path: "/app/districts/list",
//     title: "sidenav.districts",
//     icon: DeploymentUnitOutlined,
//     breadcrumb: true,
//     submenu: [],
//   });
// }
// if (CAN_VIEW_MODULE(13)) {
//   dashBoardNavTree[0].submenu.push({
//     key: "dashboard-zones",
//     path: "/app/zones/list",
//     title: "sidenav.zones",
//     icon: ForkOutlined,
//     breadcrumb: true,
//     submenu: [],
//   });
// }

/*{
  key: 'dashboard-newsletter',
  path: '/app/newsletter/inbox',
  title: 'sidenav.newsletter',
  icon: SendOutlined,
  breadcrumb: true,
  submenu: []
},*/

let ticketsNavTree = [
  {
    key: "tickets",
    path: "/app/tickets",
    title: "sidenav.tickets",
    icon: TagsOutlined,
    breadcrumb: true,
    submenu: [],
  },
];

if (CAN_VIEW_MODULE(2)) {
  ticketsNavTree[0].submenu.push({
    key: "tickets-list",
    path: "/app/tickets/list",
    title: "sidenav.tickets",
    icon: TagsOutlined,
    breadcrumb: false,
    submenu: [],
  });
}

if (CAN_VIEW_MODULE(3)) {
  ticketsNavTree[0].submenu.push({
    key: "tickets-chat",
    path: "/app/chat",
    title: "sidenav.chat",
    icon: MessageOutlined,
    breadcrumb: true,
    submenu: [],
  });
}

const reportsNavTree = [
  {
    key: "reports",
    path: "/app/reports",
    title: "sidenav.reports",
    icon: AreaChartOutlined,
    breadcrumb: false,
    submenu: [],
  },
];

if (CAN_VIEW_MODULE(104)) {
  reportsNavTree[0].submenu.push({
    key: "reports-tickets",
    path: "/app/reports/tickets",
    title: "sidenav.reports-tickets",
    icon: PieChartOutlined,
    breadcrumb: false,
    submenu: [],
  });
}
if (CAN_VIEW_MODULE(102)) {
  reportsNavTree[0].submenu.push({
    key: "reports-staff",
    path: "/app/reports/staff",
    title: "sidenav.reports-staff",
    icon: AreaChartOutlined,
    breadcrumb: false,
    submenu: [],
  });
}

let navigationConfig = [
  ...dashBoardNavTree,
  ...ticketsNavTree,
  ...reportsNavTree,
];

export default navigationConfig;

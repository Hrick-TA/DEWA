// JavaScript source code
function LoadConfigurationHomeDashboard(scope) {

    scope.widgetName = "Dashboard";
	scope.widgetTabid='tab__abadf008-c137-4220-8b87-8f3be70dd015';
    scope.dashboardTab = {
        "dahsboardList": [
			{ "Role": "AGENT", "TabName": "Agent Dashboard", "URL": "https://dewaserv6610.dewa.gov.ae:8443/RealTimeDashboard/agent.html?agentId=#HANDLE#&enableRefresh=#REFRESH#", "RefreshButtonEnable": true,"AutoRefresh":true },
            { "Role": "SUPERVISOR", "TabName": "Service Dashboard", "URL": "https://dewaserv6610.dewa.gov.ae:8443/RealTimeDashboard/queue.html?enableRefresh=#REFRESH#", "RefreshButtonEnable": true,"AutoRefresh":true },
            { "Role": "SUPERVISOR", "TabName": "Agent Activity Dashboard", "URL": "https://dewaserv6610.dewa.gov.ae:8443/RealTimeDashboard/supervisor.html?supervisorId=#HANDLE#&enableRefresh=#REFRESH#", "RefreshButtonEnable": true,"AutoRefresh":true },
        ]
    }
}

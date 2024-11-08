// JavaScript source code
function LoadConfigurationHomeScreenpop(scope) {
    scope.alertOnNoOfTabsExceeded = 6;
    scope.alertOnTabsExceededMsg = "Notification : CRM Tabs are opened more than 6";
    scope.autoCloseOldestTabExceeded = 6;
    scope.autoCloseOldestTabExceededMsg = "Oldest tab is automatically Closed"
    scope.showMessageTimeOut = 10;
    scope.crmEndURL = "https://apidev.dewa.gov.ae/v3/smartcustomer/updatecrmsession";
    scope.middlewareServiceUrl = "https://DEWASERV6573.dewa.gov.ae:8443/";
    scope.msgClosePopupTitle = "Warning"
    scope.customWidgeFocusId = '';
    scope.msgClosePopupMessage = "Dear User, please ensure that you have saved data on SAP screen before ending the session";
	 scope.crmUrl = "https://myportal.dewa.gov.ae:7900/sap/bc/bsp/sap/crm_ui_start/default.htm";
					 
    scope.QueryStrinSAPRole = 'ZUT_DEWA_CIS';
}
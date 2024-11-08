
function LoadWebEmailConfigurationDEWA(scope) {

    scope.WriteLog(INFO, "LoadEmailConfiguration ->  START");
    scope.middlewareServiceUrl = "https://dewaserv6890.dewa.gov.ae:8443";
    //scope.middlewareServiceUrl = "http://192.168.1.128:8080";
	
    //scope.middlewareServiceUrl = "https://DEWASERV6573.dewa.gov.ae:8443";
    
	scope.crmUrl = "https://myportal.dewa.gov.ae:7900/sap/bc/bsp/sap/crm_ui_start/default.htm";
    scope.ContactSearchUrl = scope.middlewareServiceUrl + "/DEWAContactSearch/ContactSearch.html";
    scope.journeyAPIUrl = ' https://dewaserv6638.dewa.gov.ae/services/CustomerJourneyService/rest/customer/element/';

    scope.defaultMinimizeCRM = true;
    scope.defaultMinimizeCustomPanel = true;

    scope.autoAnswer = false;
    scope.autoAnswerSec = 3;

    scope.defaultCategoryCode = '300';
    scope.defaultReasonCode = '300';
    scope.defaultOutcomeCode = '300';
    scope.QueryStrinSAPRole = 'ZUT_DEWA_CIS'; 
     
    scope.lang = {
        "EN": {
            "select": "Select",
            "search": "search",  
            "LABELRecentCallNotes": "Recent Email Notes",
            "LABELContactSearch": "Contact Search",
            "MSGCallNoteSaveSuccessHeader": "Save Email Notes",
            "MSGCallNoteSaveSuccessMessage": "Notes Saved successfully", 
            "LABELNotes": "Notes", 
            "LABELCallAction": "Email Action", 
            "LABELDisposition": "Disposition",
            "LABELCategory": "Category",
            "LABELOutcome": "Outcome",
            "LABELReasons": "Reasons",
            "LABELCSNotificationKey": "TYPE",
            "LABELCSNotificationValue": "VALUE",
            "LABELCRecentSearchEmail": "Email",
            "LABELCRecentSearchType": "Type",
            "LABELCRecentSearchValue": "Value",
            "BUTTONRecentSearch": "Search",
            "BUTTONRecentRefresh": "Reload",
            "MSGCallNoteSearchHeader": "Search Notes",
            "MSGCallNoteSearchMessage": "No Record Found", 
        }
    }

    scope.recentCallNoteSearch = {
        "EN": [
            { "Key": "Select", "Label": "Select" },
            //{ "Key": "AgentID", "Label": "Agent ID" },
            { "Key": "Email", "Label": "Email" },
            //{ "Key": "Phone", "Label": "Phone" },
            //{ "Key": "LastVerifiedUsedAcct", "Label": "Last Verified Account" }, 
        ]
    }


    scope.notificationCS = {
        "notificationList": [
            { "Key": "Service", "Label": "Service" },
            { "Key": "Language", "Label": "Language" },
            { "Key": "CallType", "Label": "Email Type" },
            { "Key": "HelpLine", "Label": "Help Line" },
            { "Key": "AgentGroup", "Label": "Agent Group" },
            { "Key": "SurveyOpted", "Label": "Survey Enabled" }, 
            { "Key": "MultipleEmailinQueue", "Label": "Multiple Customer Emails in Queue" },
        ]
    };
      

   

    scope.WriteLog(INFO, "LoadEmailConfiguration ->  END");

};
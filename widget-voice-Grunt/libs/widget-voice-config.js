
function LoadVoiceConfigurationDEWA(scope) {

    scope.WriteLog(INFO, "LoadEmailConfiguration ->  START");
    //Live
    //scope.middlewareServiceUrl = "https://DEWASERV6573.dewa.gov.ae:8443";
    //UAT
    scope.middlewareServiceUrl = "https://dewaserv6890.dewa.gov.ae:8443";
    //scope.middlewareServiceUrl = "https://10.15.132.210:8443";   
    //Local
    //scope.middlewareServiceUrl = "https://192.168.1.128:8443";

    //scope.crmUrl = "https://myportal.dewa.gov.ae:7900/sap/bc/bsp/sap/crm_ui_start/default.htm";
	scope.crmUrl = "https://sapqaeapp01.hec.dewa.gov.ae:44301/sap/bc/bsp/sap/crm_ui_start/default.htm";
    scope.journeyAPIUrl = ' https://dewaserv6638.dewa.gov.ae/services/CustomerJourneyService/rest/customer/element/';
    scope.defaultMinimizeCRM = true;
    scope.defaultMinimizeCustomPanel = false;
    scope.disableTransfer = false;

    scope.URLOutage = scope.middlewareServiceUrl + "/Widget_Search_Details/outage-search.html";
    scope.URLEnableDisableSMSEmail = scope.middlewareServiceUrl + "/Widget_Search_Details/SMS_Email_Exception.html";
    scope.URLVisitedIVRMenu = scope.middlewareServiceUrl + "/Widget_Search_Details/IVRTree.html";

    scope.defaultCategoryCode = '100';
    scope.defaultReasonCode = '100';
    scope.defaultOutcomeCode = '100';
    scope.QueryStrinSAPRole = 'ZUT_DEWA_CIS';
    scope.ContextStoreUpdateKey = 'AGentIVRTransferMenu';
    scope.workRequestId = 'ROCuiVm2QW677VrxRwegng';
    scope.maxQueuedTime = '10';
    scope.TranferConferenceEnabledThreshold = 20;
    scope.ConferenceVerificationThreshold = 30;

    scope.lang = {
        "EN": {
            "select": "Select",
            "search": "search",
            "LABELCustomerDetails": "Customer Details",
            "LABELIVRMenuSequences": "IVR Menu Sequences",
            "LABELEnableEmailSMS": "Enable SMS",
            "LABELRecentCallNotes": "Recent Call Notes",
            "LABELNotes": "Notes",
            "MSGCallNoteSaveSuccessHeader": "Save Call Notes",
            "MSGCallNoteSaveSuccessMessage": "Disposition Reason Saved successfully",
            "LABELTransferSurvey": "Survey Transfer",
            "LABELTransferIVR": "IVR Node",
            "LABELCustomerDetailsKey": "LABEL",
            "LABELCustomerDetailsValue": "Value",
            "LABELCallAction": "Call Action",
            "LABELAccountUsedIVR": "Accounts Used in IVR",
            "LABELIVROperationLog": "IVR Operation Logs",
            "LABELTransfer": "Transfer",
            "LABELConference": "Conference",
            "LABELDisposition": "Disposition",
            "LABELCategory": "Category",
            "LABELOutcome": "Outcome",
            "LABELReasons": "Reasons",
            "LABELCSNotificationKey": "TYPE",
            "LABELCSNotificationValue": "VALUE",
            "LABELCRecentSearchAccountNumber": "Account Number",
            "LABELCRecentSearchLastVerifiedMobile": "Last Verified Mobile",
            "LABELCRecentSearchCLI": "Calling Number",
            "BUTTONRecentSearch": "Search",
            "LABELTPINValidation": "TPIN Validation",
            "LABELTPINVerificationRequest": "TPIN is not verified, Do you like to verify customer now?",
            "LABELConferenceNotAvailable": "Account number is not present, call will not be transferred for TPIN verification",
			"LABELConferenceInvalid": "Conference is not available for this menu",
        }
    }

    scope.notificationCS = {
        "notificationList": [
            { "Key": "Language", "Label": "Language" },
            { "Key": "LastVerifiedUsedAcct", "Label": "Last Verified Used Acct" },
            { "Key": "LastVerifiedMobile", "Label": "Last Verified Associated Mobile" },
            { "Key": "SurveyOpted", "Label": "Survey Enabled" },
            { "Key": "queuedTime", "Label": "Queued Time" },
        ]
    };
    scope.customerDetailsCS = {
        "customerList": [
            { "Key": "CallType", "Label": "Call Type", "highlighted": "TRUE" },
            { "Key": "LastIVRNode", "Label": "Last IVR Node", "highlighted": "TRUE" },
            { "Key": "SelectedAccount", "Label": "Selected Account on IVR", "highlighted": "" },
            { "Key": "CustomerType", "Label": "Customer Type", "highlighted": "" },
            { "Key": "TPINVerified", "Label": "TPIN Verified", "highlighted": "TRUE" },
            { "Key": "LastVerifiedUsedAcct", "Label": "Last Verified Used Account", "highlighted": "" },
            { "Key": "LastUsedAcct", "Label": "Last Used Account", "highlighted": "" },
            { "Key": "LastVerifiedMobile", "Label": "Last Associated Mobile", "highlighted": "" },
            { "Key": "SelectedLanguage", "Label": "Selected Language", "highlighted": "" },
            { "Key": "DialedHelpLine", "Label": "Dialed Help Line", "highlighted": "" },
            { "Key": "ServiceStatus", "Label": "Disconnect Status", "highlighted": "" },
            { "Key": "DisconnectReason", "Label": "Disconnect Reason", "highlighted": "" },
            { "Key": "SLAStatus", "Label": "Reconnection SLA Status", "highlighted": "" },
            { "Key": "OutageStatus", "Label": "Outage Status", "highlighted": "" },
            { "Key": "SurveyOpted", "Label": "Survey Enabled", "highlighted": "TRUE" },
            { "Key": "TransferReason", "Label": "Transfer Reason", "highlighted": "TRUE" },
            { "Key": "Duration", "Label": "IVR Duration", "highlighted": "TRUE" },
            { "Key": "queuedTime", "Label": "Queued Time", "highlighted": "TRUE" },
            { "Key": "TimeBeforeAnswer", "Label": "Time Spent Before Answer", "highlighted": "TRUE" },
        ]
    };


    scope.TransferNumber = {
        "IVRTRANSFER": [
            { "key": "3012" }
        ],
        "IVRCONFERENCE": [
            { "key": "3013" }
        ],
        "SURVEY": [
            { "key": "5020", "value": "Informational", "OCDSvalue": "AgentInformation" },
            { "key": "5020", "value": "Transactional", "OCDSvalue": "AgentTransaction" }
        ]
    }
    scope.WriteLog(INFO, "LoadEmailConfiguration ->  END");

};
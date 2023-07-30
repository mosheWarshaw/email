export {SetHomePageListeners};

class SetHomePageListeners{
    addContactObj;
    onEmailPreviewClicked;
    getEmailBody;
    sendEmailObj;
    getMoreEmailsObj;
    credentials;
    constructor(addContactObj, onEmailPreviewClicked, emailsObj, sendEmailObj, getMoreEmailsObj, credentials){
        this.addContactObj = addContactObj;
        this.onEmailPreviewClicked = onEmailPreviewClicked;
        this.emailsObj = emailsObj;
        this.sendEmailObj = sendEmailObj;
        this.getMoreEmailsObj = getMoreEmailsObj;
        this.credentials = credentials;
    }

    setHomePageListeners(){
        let thisObj = this;
        $("#addContactButton").on("click", function(){
            thisObj.addContactObj.onAddContactClick(thisObj.addContactObj)
        });
        //This is event delegation in jqeury.
        $("article").on("click", "div", function(event){
            /*event.target.id is the id of the specific email preview
            part of the article that was clicked.*/
            thisObj.onEmailPreviewClicked(event.target.id, thisObj.emailsObj, thisObj.credentials);
        });
        $("#sendEmailButton").on("click", function(){
            thisObj.sendEmailObj.onSendEmailClicked(thisObj.sendEmailObj);
        });
        $("#getOldGroup").on("click", function(){
            thisObj.getMoreEmailsObj.getOldGroup(this.credentials, thisObj.getEmailsObj);
        });
        $("#refreshInbox").on("click", function(){
            thisObj.getMoreEmailsObj.refreshInbox(this.credentials, thisObj.getEmailsObj);
        });
    }
}
export {LoginAndCreateAccount};

class LoginAndCreateAccount{
    credentials;
    loginButtonId;
    createAccountButtonId;
    usernameInputId;
    passwordInputId;
    loginUrl;
    createAccountUrl;
    displayHomePageObj;
    setHomePageListenersObj;
    constructor(credentials, loginButtonId, createAccountButtonId, usernameInputId, passwordInputId, loginUrl, createAccountUrl, displayHomePageObj, setHomePageListenersObj){
        this.credentials = credentials;
        this.loginButtonId = loginButtonId;
        this.createAccountButtonId = createAccountButtonId;
        this.usernameInputId = usernameInputId;
        this.passwordInputId = passwordInputId;
        this.loginUrl = loginUrl;
        this.createAccountUrl = createAccountUrl;
        this.displayHomePageObj = displayHomePageObj;
        this.setHomePageListenersObj = setHomePageListenersObj;
    }

    
    setCredentialsListeners(){
        let thisObj = this;
        let objToSend;
        $("#" + this.loginButtonId).click(function(){
            objToSend = thisObj.gatherDataToSend();
            if(objToSend != null){
                thisObj.credentialsButtonClicked(objToSend, thisObj.loginUrl);
            }
        });
    
        $("#" + this.createAccountButtonId).click(function(){
            objToSend =  thisObj.gatherDataToSend();
            if(objToSend != null){
                thisObj.credentialsButtonClicked(objToSend, thisObj.createAccountUrl);
            }
        });
    }


    gatherDataToSend(){
        let usernameVal = $("#" + this.usernameInputId).val();
        this.credentials.username = usernameVal;
        let passwordVal = $("#" + this.passwordInputId).val();
        this.credentials.password = passwordVal;
        if(usernameVal == "" || passwordVal == ""){
            alert("You must enter credentials to login or create an account.");
            return null;
        }
        else{
            return {"username" : usernameVal, "password" : passwordVal, "type" : "web"};
        }
    }


    credentialsButtonClicked(objToSend, urlPar){
        let thisObj = this;
        $.ajax({
            url: urlPar,
            type: "POST",
            data: JSON.stringify(objToSend),
            contentType: "application/json",
            dataType: "json",
            success: function(returnedData){
                thisObj.onSuccess(returnedData);
            },
            error: thisObj.onErr
        });
    }


    /*I handle the html returned (and not just have the server send an html
    file, and have it displayed upon recieving it without doing anything)
    so I could check if the home page was returned or if it wasn't because the
    credential were invalid and the user needs to stay on the
    loginOrCreateAccount page so they can try again.*/
    onSuccess(returnedData){
        if(returnedData.hasMessage){
            alert(returnedData.message);
        }
        else{
            this.displayHomePageObj.displayHomePage(returnedData);
            this.setHomePageListenersObj.setHomePageListeners();
        }
    }
   
    onErr(jqXhr){
        alert(jqXhr.status + " " + jqXhr.responseText);
    }
}
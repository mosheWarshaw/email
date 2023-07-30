export {AddContact};

class AddContact{
    credentials;
    constructor(credentials){
        this.credentials = credentials;
    }


    onAddContactClick(){
        let thisObj = this;
        $("#addContactDialog").html(
            `<input placeholder="Contact's username" id="contactsUsername"/>`
        );
        $("#addContactDialog").dialog({
            title: "Add a Contact",
            closeText: "",
            height: .40 * window.innerHeight,
            width: .40 * window.innerWidth,
            buttons:[{
                text: "Add",
                click: function(){
                    thisObj.sendContact(thisObj.credentials.username,
                        thisObj.credentials.password);
                }
            }]
        });
    }


    sendContact(username, password){
        let thisObj = this;
        let contact = $("#contactsUsername").val();
        let objToSend = {
            "username" : username,
            "password" : password,
            "contact" :  contact,
            "type" : "web"
        };
        $.ajax({
            url: "/addContact",
            type: "POST",
            data: JSON.stringify(objToSend),
            contentType: "application/json",
            success: function(){
                thisObj.onSuccess(contact)
            },
            error: thisObj.onErr
        });
    }


    onSuccess(contact){
        $("#contactsList").append(contact + "</br>");
        $("#addContactDialog").dialog("close");
    }

    
    onErr(jqXhr){
        alert(jqXhr.status + " " + jqXhr.responseText);
    }
}
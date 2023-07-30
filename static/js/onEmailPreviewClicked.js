export {onEmailPreviewClicked};

async function onEmailPreviewClicked(idOfClickedElem, emailsObj, credentials){
    /*The first 2 chars are letters, they're not part of any index,
    so the first parameter is 2.*/
    let groupIndexStr = idOfClickedElem.substr(2, idOfClickedElem.indexOf(';') - 2);
    let groupIndex = parseInt(groupIndexStr);
    /*The emailIndex starts after the 2 letters of the id, the group index
    number, and the semicolon. The semicolon separates the roup index
    and the email index.*/
    let emailIndex = parseInt(idOfClickedElem.substr(2 + groupIndexStr.length + 1, idOfClickedElem.length));
    let emailsBody = emailsObj.getBody(groupIndex, emailIndex);


    let senderOfFile;
    let nameOfFile;
    let response;
    let blob;
    let file;
    let fileUrl;
    let aTag = "";
    let fileIsIncluded = emailsObj.getFileIsIncluded(groupIndex, emailIndex);
    if(fileIsIncluded){
        senderOfFile = emailsObj.getSender(groupIndex, emailIndex);
        nameOfFile = emailsObj.getFileName(groupIndex, emailIndex);
        response = await fetch("http://localhost:5000/getEmailFile", {
            method : "POST",
            body : JSON.stringify({
                "theUserRequestingTheFile" : credentials.username,
                "passwordOfTheUserRequestingTheFile" : credentials.password,
                "senderOfFile" : senderOfFile,
                "nameOfFileToGet" : nameOfFile
            }),
            headers : {
                'Content-type': 'application/json; charset=UTF-8'
            }
        });

        if(response.ok){
            blob = await response.blob();
            file = new File([blob], "");
            fileUrl = URL.createObjectURL(file);
            /*The value of the "download" attribute is the name the
            file will have when downloaded.*/
            aTag = "<a href='" + fileUrl +"' download='" + nameOfFile + "'>" +
                nameOfFile + "</a><br/>";
        }
        else{
            alert(response.statusText);
        }
    }
    

    $("#viewAnEmailDialog").html(
        aTag + emailsBody
    );
    $("#viewAnEmailDialog").dialog({
        title: "Email body",
        closeText: "",
        height: .9 * window.innerHeight,
        width: .8 * window.innerWidth
    });
}
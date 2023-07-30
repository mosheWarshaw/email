from flask import Flask, render_template, request, send_file
import json
from datetime import datetime
import requests
import os

import mongo

app = Flask(__name__)
GROUP_SIZE = 25

#vt is an abbreviation of Virus Total.
vtUrl = "https://www.virustotal.com/api/v3/files"
vtApiKey = os.environ["VT_API_KEY"].getVirusTotalApiKey()
vtHeaders = {
    "accept": "application/json",
    "x-apikey": vtApiKey
}
def sendFileToVt(uploadedFile):
    mimeType = uploadedFile.mimetype
    fileObj = {"file": (uploadedFile.filename, uploadedFile.read(), mimeType)}
    response = requests.post(vtUrl, files=fileObj, headers=vtHeaders)
    return response.status_code


#In most cases I will return the html or the data in json form of
#what the user was requesting, or a status code asying there was
#an err, and with a message about the error. Sometimes I have to
#end the user a message, and not the data or html they wanted, even
#there wasn't an err. Example: when the user refreshes their inbox
#but there aren't any new emails to send them. The server doesn't
#have any new emails to send the user, but the server wants to
#let the user know this, so the server will send a message,
#and the user didn't do anything wrong or cause any errors
#by refreshing their inbox when there wasn't new emails.

@app.route("/")
def loginAndCreateAccountPage():
    return render_template("loginOrCreateAccount.html")



@app.route("/login/", methods=["PUT", "POST"])
@app.route("/login", methods=["PUT", "POST"])
def login():
    sentJson = request.get_json()
    username = sentJson["username"]
    password = sentJson["password"]
    type = sentJson["type"]
    if mongo.verifyCredentials(username, password):
        contacts = mongo.getContacts(username)
        mostRecentEmailNum = mongo.getMostRecentEmailNum(username)
        emails = mongo.getEmails(username, mostRecentEmailNum - GROUP_SIZE, mostRecentEmailNum)
    
        if type == "web":
            return json.dumps({
                "hasMessage" : False,
                "emails" : emails,
                "html" : render_template("home.html", contactsList = contacts)
            })
        else: #type == "android"
            return json.dumps({
                "hasMessage" : False,
                "emails" : emails,
                "contacts" : contacts
            })

    #It isn't an err for providing invalid credentials when signing in,
    #because people often mistype their password.
    return json.dumps({
        "hasMessage" : True,
        "message" : "You have provided invalid credentials. Try again."
    }), 200



@app.route("/createAccount/", methods=["PUT", "POST"])
@app.route("/createAccount", methods=["PUT", "POST"])
def createAccount():
    sentJson = request.get_json()
    username = sentJson["username"]
    password = sentJson["password"]
    type = sentJson["type"]
    accountCreated = mongo.createAccount(username, password)
    print(accountCreated)
    if accountCreated:
        if type == "web":
            return json.dumps({
                "hasMessage" : False,
                "emails" : [],
                "html" : render_template("home.html", contactsList = [])
            }), 200
        else: #type == "android"
            return json.dumps({
                "hasMessage" : False,
                "emails" : [],
                "contacts" : []
            }), 200
    return json.dumps({
        "hasMessage" : True,
        "message" : "The username you provided is already taken. Choose another one."
    }), 200




@app.route("/sendEmail/", methods=["POST"])
@app.route("/sendEmail", methods=["POST"])
def sendEmail():
    sender = request.form["sender"]
    password = request.form["password"]
    verified = mongo.verifyCredentials(sender, password)
    if verified:
        receiver = request.form["receiver"]
        approved = mongo.verifyContact(sender, receiver)
        if approved:
            fileName = None
            fileIsIncluded = request.form["fileIsIncluded"] == "true"
            if fileIsIncluded:
                uploadedFile = request.files["userFile"]
                fileName = uploadedFile.filename
                
                status_code = sendFileToVt(uploadedFile) 
                if status_code != 200:
                    return json.dumps({
                        "hasMessage": True,
                        "message" : "File contained virus. Email wasn't sent."
                    })
                
                #Since the the file was read when sending the file to
                #virus total the cursor is at the end of the file.
                #The line below resets te cursor to the beginning of the file
                #because the file will be read in code later in this method
                #when it's being saved, so it needs to be read from the
                #beginning so the entire thing is stored.
                uploadedFile.seek(0)

                #Sometimes the user will attach a file to the email
                #they want to send to someone. These files aren't stored
                #in the database, rater they are stored in a file system
                #They are stored in C:\mcon353\project\emailFolders .
                #Each user has a folder in emailFolders (the name of their
                #folder is their username. This folder is created when their
                #account is created) containing all the files they attached
                #to emails they were sending.
                #The file is only stored in the sender's folder, not in the
                #sender's and receiver's.
                #In the database, with the other data of the email (such as
                #the body of the email), the name of the file is
                #stored so that the server can retrieve the file
                #that was sent with this email.
                #Sidepoint: If the user wants to send multiple files then they
                #should send a zip folder.
                placeToPutTheFile = "C:\\mcon353\\emailFolders\\" + sender
                app.config["UPLOAD_FOLDER"] = placeToPutTheFile
                uploadedFile.save(
                    os.path.join(
                        app.config["UPLOAD_FOLDER"],
                        uploadedFile.filename
                    )
                )
                
            subject = request.form["subject"]
            dt_tm = str(datetime.now().strftime("%x")) + " " + str(datetime.now().strftime("%X"))
            body = request.form["body"]
            mongo.insertEmail(sender, sender, subject, dt_tm, body, fileIsIncluded, fileName)            
            theUserisSendingTheEmailToThemself = sender == receiver
            insertEmailInReceiversAccountToo = not theUserisSendingTheEmailToThemself
            if insertEmailInReceiversAccountToo:
                mongo.insertEmail(receiver, sender, subject, dt_tm, body, fileIsIncluded, fileName)
            
            startEmailNum = int(request.form["startEmailNum"])
            endEmailNum = mongo.getMostRecentEmailNum(sender)
            return json.dumps({
                "hasMessage" : False,
                "emails" : mongo.getEmails(sender, startEmailNum, endEmailNum)
            })
        #The reciever doesn't have the sender in their contacts, or there isn't
        #an account with the username the sender is trying to send to.
        else:
            return "Contacts issue.", 403
    else:
        return "Invalid credentials.", 401




@app.route("/getEmailFile/", methods=["POST"])
@app.route("/getEmailFile", methods=["POST"])
def getEmailFile():
    sentJson = request.get_json()
    
    theUserRequestingTheFile = sentJson["theUserRequestingTheFile"]
    passwordOfTheUserRequestingTheFile = sentJson["passwordOfTheUserRequestingTheFile"]
    verified = mongo.verifyCredentials(theUserRequestingTheFile, passwordOfTheUserRequestingTheFile)
    if verified:
        theSenderOfTheFile = sentJson["senderOfFile"]
        fileName = sentJson["nameOfFileToGet"]
        return send_file("C:\\mcon353\\emailFolders\\" + theSenderOfTheFile + "\\" + fileName, as_attachment=True)
    else:
        return "Invalid credentials.", 401



@app.route("/getEmails/", methods=["PUT", "POST"])
@app.route("/getEmails", methods=["PUT", "POST"])
def getEmails():
    sentJson = request.get_json()
    type = sentJson["type"]
    username = sentJson["username"]
    password = sentJson["password"]
    verified = mongo.verifyCredentials(username, password)
    if verified:
        startEmailNum = sentJson["startEmailNum"]
        endEmailNum = None

        if sentJson["hasEndEmailNum"]:
            endEmailNum = sentJson["endEmailNum"]
        else:
            endEmailNum = mongo.getMostRecentEmailNum(username)
            if endEmailNum == -1:
                return "Invalid username.", 401
            elif endEmailNum == None:
                return json.dumps({
                    "hasMessage" : True,
                    "message" : "There aren't more emails."
                }), 200

        emails = mongo.getEmails(username, startEmailNum, endEmailNum)
        if len(emails) == 0:
            return json.dumps({
                "hasMessage" : True,
                "message" : "There aren't more emails."
            }), 200
        return json.dumps({
            "hasMessage" : False,
            "emails" : emails
        })
    else:
        if type == "web":
            return "Invalid credentials.", 401
        else: #type == "android"
            return json.dumps({
                "hasMessage" : True,
                "message" : "Invalid credentials."
            })

 


@app.route("/addContact/", methods=["PUT", "POST"])
@app.route("/addContact", methods=["PUT", "POST"])
def addContact():
    sentJson = request.get_json()
    type = sentJson["type"]
    username = sentJson["username"]
    password = sentJson["password"]
    verified = mongo.verifyCredentials(username, password)
    if verified:
        contact = sentJson["contact"]
        mongo.addContact(username, contact)
        if type == "web":
            return ""
        else: #type == "android"
            return json.dumps({
                "hasMessage" : False
            })
    else:
        if type == "web":
            return "Invalid credentials.", 401
        else: #type == "android"
            return json.dumps({
                "hasMessage" : True,
                "message" : "Invalid credentials."
            })




#I'm just creating a separate endpoint and method for the android app
#for now, because I haven't yet looked into uploading and sending a
#file from android.
@app.route("/sendEmailFromAndroid/", methods=["POST", "PUT"])
@app.route("/sendEmailFromAndroid", methods=["POST", "PUT"])
def sendEmailFromAndroid():
    sentJson = request.get_json()
    sender = sentJson["sender"]
    receiver = sentJson["receiver"]
    approved = mongo.verifyContact(sender, receiver)
    if approved:
        subject = sentJson["subject"]
        dt_tm = str(datetime.now().strftime("%x")) + " " + str(datetime.now().strftime("%X"))
        body = sentJson["body"]

        mongo.insertEmail(sender, sender, subject, dt_tm, body, None, None)
        #i won't add the email to the receiver's account if the sender is the receiver (the user sent themself an email), because that would be sending the email to the user twoce.
        if sender != receiver:
            mongo.insertEmail(receiver, sender, subject, dt_tm, body, None, None)
        
        sendersEmailNumForThisEmail = mongo.getMostRecentEmailNum(sender)
        jsonToGiveTheSender = json.dumps({
            "hasMessage" : False,
            "emailNum" : sendersEmailNumForThisEmail,
            "dt_tm" : dt_tm
        })
        return jsonToGiveTheSender
    #The reciever doesn't have the sender in their contacts, or there isn't
    #an account with the username the sender is trying to send to.
    else:
        return json.dumps({
            "hasMessage" : True,
            "message" : "Contacts issue."
        })
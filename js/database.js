/*
DB structure:
headerdata - header data of each table
tabledata - first table
tableindex - list of all tables

tables : table1, table2 ...

 */


var database;   // current database

var lastExportDate; // date of export data to file (stored in db)
var modificationDate;   // date of file-modification
var lastSyncDate;   // date of last sync




var db = {
    settings: {
        shortName: 'kmd11e',
        version: '1.0',
        displayName: 'KMD app',
        maxSize: 655367 // in bytes
    }
};

db.init = function(success_callback)
{

    if(testNoDB) return;

    logging("Db si initiating",1);
    try {
        if (!window.openDatabase) {
            alert('not supported');
        } else {
            database = openDatabase(db.settings.shortName, db.settings.version, db.settings.displayName, db.settings.maxSize);
            logging("Db opened",1);
        }
    } catch(e) {
        // Error handling code goes here.
        if (e == "INVALID_STATE_ERR") {
            // Version number mismatch.
            logging("Invalid database version",3);
        } else {
            logging("DB initiating Unknown error "+e,3);
        }
        return;
    }

    db.createTables();
};



db.createTables = function()
{
    database.transaction(function(tx)
    {
        if(testFirst)
        {
            tx.executeSql('DROP TABLE IF EXISTS sheetsheaders');
            tx.executeSql('DROP TABLE IF EXISTS sheetsdata');
            tx.executeSql('DROP TABLE IF EXISTS meta');
            tx.executeSql('DROP TABLE IF EXISTS code');
            tx.executeSql('DROP TABLE IF EXISTS howPaid');
        }


        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsheaders (shid NUMBER,category, code, planSpend TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsdata (shid NUMBER, rowid NUMBER, dater, paid, desc, checkRef, payment TEXT, balance TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS code (code TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS howPaid (howPaid TEXT)');

        database.transaction(function(tx) {
            tx.executeSql('SELECT count(*) as c FROM sqlite_master WHERE type="table" AND name="meta"', [], function(tx, results) {
                if(results.rows.item(0).c == 0)
                {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS meta (openedSheet NUMBER, lastExport TEXT,lastSyncDate TEXT)');

                    database.transaction(function(tx)
                    {
                        tx.executeSql('INSERT INTO meta (openedSheet, lastExport,lastSyncDate) VALUES (0,"","")');
                    }, errorCB);

                }
            }, errorCB);
        }, errorCB);

        // check data and if exist generate file
        //db.sheetsdataRowsCount(generateFile);
        initFs();


    }, errorCB, db.initSheetsData);
};

// fill up category drop-down, if exist sheets show them, if not create new one
db.initSheetsData = function()
{
    logging("db.initSheetsData",1);

    database.transaction(function(tx)
    {
        //fill up code drop-down
        tx.executeSql('SELECT code FROM code', [], function(tx, results)
        {
            len = results.rows.length;
            if(len>0)
            {

                $("div.instruction").append("<div class='checkboxes'>");

                for (var i=0; i<len; i++){
                    $("#code").append($("<option></option>").attr("value", results.rows.item(i).code).text(results.rows.item(i).code));
                    $(".instructions div.pickUp").append('<input type="checkbox" value="'+results.rows.item(i).code+'"><span>'+results.rows.item(i).code+'</span><br>');
                }

            } else
            {
                codesSetDefaults();
            }



        }, errorCB);

        //fill up howPaid
        tx.executeSql('SELECT howPaid FROM howPaid', [], function(tx, results)
        {
            len = results.rows.length;
            if(len>0)
            {
                dbHowPaidOptionsHtml = "";
                for (var i=0; i<len; i++){
                    dbHowPaidOptionsHtml += "<option>" + results.rows.item(i).howPaid + "</option>";
                }
            }



        }, errorCB);


        tx.executeSql('SELECT * FROM sheetsheaders', [], function(tx, results)
        {
            $("#categorySelect").empty();
            $("#categorySelect").append($("<option></option>").attr("value","Instructions").text("Instructions"));

            len = results.rows.length;
            if(len==0)
            {
                //newWTable();
                showInstructions(true);
                //showInstructionsCodes();

                $("body").css("display","block");
                $("#categorySelect").append($("<option></option>").attr("value","New page").text("New page"));
            }
            else
            {
                //fill up category drop-down
                for (var i=0; i<len; i++){
                    $( "#categorySelect" ).append($("<option></option>").attr("value", results.rows.item(i).shid).text(results.rows.item(i).category));
                }
                $("#categorySelect").append($("<option></option>").attr("value","New page").text("New page"));
                // load header and table
                // get last opened sheet shid
                database.transaction(function(tx)
                {
                    tx.executeSql('SELECT openedSheet FROM meta', [], function(tx, results)
                    {
                        $("#categorySelect").val(results.rows.item(0).openedSheet);
                        db.loadSheet();
                    }, errorCB);
                }, errorCB);
            }
        }, errorCB);


    }, errorCB);
};


db.CreateNextTable = function()
{
    logging("CreateNextTable",1);
    database.transaction(function(tx)
    {
        tx.executeSql('SELECT max(shid) as lastshid FROM sheetsheaders', [], function(tx, results)
        {
            var shid;


                shid = Number(results.rows.item(0).lastshid) + 1;
                //$("#categorySelect").append($("<option></option>").attr("value", shid).text(""));

                $("#categorySelect option").eq($("#categorySelect > option").length-1).before($("<option></option>").val(shid).html(""));
                $("#categorySelect").val(shid);

            db.setOpenedSheet();

            database.transaction(function(tx){
                tx.executeSql('INSERT INTO sheetsheaders (shid,category, code, planSpend) VALUES ('+Number(shid)+',"", "", "0.00")');
            }, errorCB);

        }, errorCB);
    }, errorCB);
};



db.headerUpdate = function()
{
    if(!lastSyncOK()) return;
    database.transaction(function(tx)
    {
        var category = $("#category").val();
        var code = $("#code option:selected").text();
        var planSpend = $("#planSpend").val();
        var shid = shidCurrentGet();
        console.log("UPDATE sheetsheaders SET category='"+category+"', code='"+code+"', planSpend='"+planSpend+"' WHERE shid='"+shid+"'");
        //console.log('UPDATE sheetsheaders SET category="'+category+'", code="'+code+'", planSpend="'+planSpend+'" WHERE shid="'+shid+'"');
        tx.executeSql("UPDATE sheetsheaders SET category='"+category+"', code='"+code+"', planSpend='"+planSpend+"' WHERE shid='"+shid+"'");
        //tx.executeSql('UPDATE sheetsheaders SET category="'+category+'", code="'+code+'", planSpend="'+planSpend+'" WHERE shid="'+shid+'"');
        //tx.executeSql('INSERT INTO headerdata (category, code, planSpend) VALUES ("'+category+'", "'+code+'", '+planSpend+')');
    }, errorCB);
};


db.rowUpdateInsert = function()
{
    logging("rowUpdateInsert",1);
    logging("rowUpdatedID"+rowUpdatedID,1);
    var shid = shidCurrentGet();
    database.transaction(function(tx) {
        tx.executeSql('SELECT * FROM sheetsdata WHERE rowid='+rowUpdatedID+' and shid='+shid, [], function(tx, results) {
            if(results.rows.length == 0)
            {
                dbUpdateOrInsert(tx,"insert");
            } else
            {
                dbUpdateOrInsert(tx,"update");
            }
        }, errorCB);
    }, errorCB);
};

function dbUpdateOrInsert(tx,type) {
    logging("dbUpdateOrInsert: " + type,1)
    //tx.executeSql('CREATE TABLE IF NOT EXISTS tabledata (id unique, data)');
    var el = $('li[data-id|="'+rowUpdatedID+'"]');
    var rowID = $(el).attr("data-id");
    var dater = $(el).find(".dater input").val();
    var paid = $(el).find(".paid select").val();
    var desc = $(el).find(".description input").val();
    var checkRef = $(el).find(".checkRef input").val();
    var payment = $(el).find(".payment input").val();
    var balance = $(el).find(".last input").val();
    var shid = shidCurrentGet();
    //console.log('UPDATE wt'+currentWtable+' SET dater="'+dater+'", paid="'+paid+'", desc="'+desc+'", checkRef="'+checkRef+'", payment='+payment+', balance='+balance+' WHERE rowid='+rowID);
    if(type=="update") tx.executeSql('UPDATE sheetsdata SET dater="'+dater+'", paid="'+paid+'", desc="'+desc+'", checkRef="'+checkRef+'", payment="'+String(payment)+'", balance="'+balance+'" WHERE rowid='+rowID+' and shid='+shid);
    if(type=="insert") tx.executeSql('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES ('+shid+','+rowID+', "'+dater+'", "'+paid+'", "'+desc+'", "'+checkRef+'", "'+payment+'", "'+balance+'")');
}

db.loadSheet = function()
{

    if($("#categorySelect option:selected").val()=="Instructions")
    {
        showInstructions(true);
        $("body").css("display","block");
        $("#category").val("Instructions");
        return;
    }
    // this code is in newWTable
    if(categorySelectPrev=="Instructions")
    {
        showInstructions(false);
        $("body").css("display","block");
    }

    var shid = shidCurrentGet();

    database.transaction(function(tx){
        tx.executeSql('SELECT * FROM sheetsheaders WHERE shid="'+shid+'"', [], function(tx, results) {

            if(results.rows.length>0)
            {

                $("#category").val(results.rows.item(0).category);
                //$("#code option:selected" ).text(results.rows.item(0).code);
                $("#code").val(results.rows.item(0).code);
                $("#planSpend").val(results.rows.item(0).planSpend);
            }


        }, errorCB);
    }, errorCB);

    database.transaction(function(tx){
        tx.executeSql('SELECT * FROM sheetsdata WHERE shid="'+shid+'"', [], function(tx, results) {
                var len = results.rows.length;
                //console.log("tabledata table: " + len + " rows found.");
                $("ul.content").empty();
                lastRowID = 0;
                for (var i=0; i<len; i++){
                    //console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).payment);
                    $("ul.content").append('<li data-id="'+results.rows.item(i).rowid+'"> <span class="dater"><input onchange="dateFormatCheck(this)" value="'+results.rows.item(i).dater+'"></span> <span class="paid"><select>'+dbHowPaidOptionsHtml+'</select></span> <span class="description"><input  value="'+results.rows.item(i).desc+'" onchange="addRowCheck(this)"></span> <span class="checkRef"><input value="'+results.rows.item(i).checkRef+'"></span> <span class="payment"><input onchange="priceFormatCheck(this)" value="'+results.rows.item(i).payment+'"></span> <span class="last"><input style="color:'+(results.rows.item(i).balance>=0?String("black"):String("red"))+'"  value="'+results.rows.item(i).balance+'" readonly></span> </li>');
                    // select right option on the select
                    $("ul.content").find("li[data-id='"+results.rows.item(i).rowid+"']").find("select").val(results.rows.item(i).paid);
                    //value="'+results.rows.item(i).paid+'"
                    lastRowID = i + 1;
                }
                addRow();
            }
            , errorCB);
    }, errorCB);


};

db.getLastSheetIndex = function(success_callback)
{
    database.transaction(function(tx)
    {
        tx.executeSql('SELECT max(shid) FROM sheetsheaders', [], function(tx, results)
        {
            if(results.rows.length == 0)
            {
                success_callback(0);
            } else
            {
                success_callback();
            }
        }, errorCB);

    }, errorCB);
}

db.setOpenedSheet = function()
{
    if($("#categorySelect option:selected").val()=="Instructions")
    {
        return;
    }
    database.transaction(function(tx)
    {
        var shid = shidCurrentGet();
        tx.executeSql('UPDATE meta SET openedSheet='+shid);
    }, errorCB);
};

db.setLastExport = function()
{
    database.transaction(function(tx)
    {
        //var date = new Date();
        var dateString = String(modificationDate.getFullYear()) + "-" + String(modificationDate.getMonth()+1) + "-" + modificationDate.getDate() + "-" + modificationDate.getHours() + "-" + modificationDate.getMinutes();
        lastExportDate = dateString;
        //alert('UPDATE meta SET lastExport='+String(dateString));
        tx.executeSql('UPDATE meta SET lastExport="'+dateString+'"');
    }, errorCB);
};

db.readLastExport = function(success_callback)
{
    database.transaction(function(tx,success_callback)
    {
        tx.executeSql('SELECT lastExport FROM meta', [], function(tx, results)
        {

            lastExportDate = results.rows.length==0?"":results.rows.item(0).lastExport;
        }, errorCB, success_callback);
    }, errorCB, success_callback);
};

db.setLastSync = function()
{
    database.transaction(function(tx)
    {
        //var date = new Date();
        currentDate = new Date();
        var dateString = String(currentDate.getFullYear()) + "-" + String(currentDate.getMonth()+1) + "-" + currentDate.getDate() + "-" + currentDate.getHours() + "-" + currentDate.getMinutes();
        lastSyncDate = dateString;
        //alert('UPDATE meta SET lastExport='+String(dateString));
        tx.executeSql('UPDATE meta SET lastSyncDate="'+dateString+'"');
    }, errorCB);
};

db.readLastSync = function(success_callback)
{
    database.transaction(function(tx,success_callback)
    {
        tx.executeSql('SELECT lastSyncDate FROM meta', [], function(tx, results)
        {
            lastSyncDate = results.rows.item(0).lastSyncDate;
        }, errorCB, success_callback);
    }, errorCB, success_callback);
};

db.sheetsdataRowsCount = function(success_callback)
{
    database.transaction(function(tx,success_callback)
    {
        tx.executeSql('SELECT count(*) as count FROM sheetsdata', [], function(tx, results)
        {
            db.sheetsdataRowsCountNum = results.rows.item(0).count;
        }, errorCB, success_callback);
    }, errorCB, success_callback);
};

function errorCB(err) {
    logging("Error processing SQL: "+err,3);
}

// --------------- import
db.importSheets = function(xml,success_callback)

{

    database.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS sheetsdata');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsdata (shid NUMBER, rowid NUMBER, dater, paid, desc, checkRef, payment TEXT, balance TEXT)');

        tx.executeSql('DROP TABLE IF EXISTS sheetsheaders');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsheaders (shid NUMBER,category, code, planSpend TEXT)');

        var sheets = xml.getElementsByTagName("sheet");
        if(sheets.length>0)
        {
            for (var i = 0; i < sheets.length; i++) {
                console.log("sheets.length" + sheets.length);
                //var sheet = sheets[i].firstChild.nodeValue;
                var sheet = sheets[i];
                var category = sheet.getElementsByTagName("category");
                //console.log(category[0].firstChild.nodeValue);
                //tx.executeSql('INSERT INTO sheetsheaders (shid, category, code, planSpend) VALUES ('+sheet.getElementsByTagName("shid")[0].firstChild.nodeValue+','+sheet.getElementsByTagName("category")[0].firstChild.nodeValue+','+Encoder.htmlDecode(sheet.getElementsByTagName("code")[0].firstChild.nodeValue)+', '+sheet.getElementsByTagName("planSpend")[0].firstChild.nodeValue+')');
                tx.executeSql('INSERT INTO sheetsheaders (shid, category, code, planSpend) VALUES ('+sheet.getElementsByTagName("shid")[0].firstChild.nodeValue+','+getXmlNodeValue(sheet,"category")+','+getXmlNodeValue(sheet,"code")+', '+getXmlNodeValue(sheet,"planSpend")+')');
                  console.log('INSERT INTO sheetsheaders (shid, category, code, planSpend) VALUES ('+sheet.getElementsByTagName("shid")[0].firstChild.nodeValue+','+getXmlNodeValue(sheet,"category")+','+getXmlNodeValue(sheet,"code")+', '+getXmlNodeValue(sheet,"planSpend")+')');

                var rows =  sheet.getElementsByTagName("row");
                console.log(rows.length);
                for (var j = 0; j < rows.length; j++) {
                    var row = rows[j];

                    tx.executeSql('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES ('+getXmlNodeValue(sheet,"shid")+','+getXmlNodeValue(row,"rowID")+', '+getXmlNodeValue(row,"date")+', '+getXmlNodeValue(row,"paid")+', '+getXmlNodeValue(row,"desc")+', '+getXmlNodeValue(row,"ref")+', '+getXmlNodeValue(row,"payment")+', '+getXmlNodeValue(row,"available")+')');
                    console.log('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES ('+getXmlNodeValue(sheet,"shid")+','+getXmlNodeValue(row,"rowID")+', '+getXmlNodeValue(row,"date")+', '+getXmlNodeValue(row,"paid")+', '+getXmlNodeValue(row,"desc")+', '+getXmlNodeValue(row,"ref")+', '+getXmlNodeValue(row,"payment")+', '+getXmlNodeValue(row,"available")+')');

                }
            }
        }

        db.initSheetsData();

    }, errorCB);


};


function getXmlNodeValue(obj,TagName)
{
    if(obj.getElementsByTagName(TagName)[0].firstChild==null)
    return '2';
    else
        return (IsNumeric(obj.getElementsByTagName(TagName)[0].firstChild.nodeValue)?obj.getElementsByTagName(TagName)[0].firstChild.nodeValue:getQuoted(obj.getElementsByTagName(TagName)[0].firstChild.nodeValue));
    //return (IsNumeric(obj.getElementsByTagName(TagName)[0].firstChild.nodeValue)?obj.getElementsByTagName(TagName)[0].firstChild.nodeValue:'"'+obj.getElementsByTagName(TagName)[0].firstChild.nodeValue+'"');

}

function getQuoted(txt)
{
    if(txt.indexOf("'") != -1)
    {
        return '"'+txt+'"';
    } else
    {
        return "'"+txt+"'";
    }
}

function IsNumeric(input)
{
    return (input - 0) == input && (''+input).replace(/^\s+|\s+$/g, "").length > 0;
}

db.importHowPaid = function(xml,success_callback)
{
    database.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS howPaid');
        tx.executeSql('CREATE TABLE IF NOT EXISTS howPaid (howPaid TEXT)');

        var howPaidTags = xml.getElementsByTagName("howPaid");
        if(howPaidTags.length>0)
        {
            var howPaidTag = howPaidTags[0];
            var howPaidOptions = howPaidTag.getElementsByTagName("option");

            console.log("howPaidOptions.length"+howPaidOptions.length);

            for (var i = 0; i < howPaidOptions.length; i++) {
                var option = howPaidOptions[i];
                //console.log(option.firstChild.nodeValue);
                tx.executeSql('INSERT INTO howPaid (howPaid) VALUES ("'+option.firstChild.nodeValue+'")');
            }
        }
    }, errorCB);
};

db.importCode = function(xml,success_callback)
{
    database.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS code');
        tx.executeSql('CREATE TABLE IF NOT EXISTS code (code TEXT)');


        var codeTags = xml.getElementsByTagName("code");

        if(codeTags.length>0)
        {
            var codeTag = codeTags[0];
            var codeOptions = codeTag.getElementsByTagName("option");

            console.log("codeOptions.length"+codeOptions.length);

            for (var i = 0; i < codeOptions.length; i++) {
                var option = codeOptions[i];
                console.log('INSERT INTO code (code) VALUES ("'+option.firstChild.nodeValue+'")');
                tx.executeSql("INSERT INTO code (code) VALUES ('"+option.firstChild.nodeValue+"')");
            }
        }
    }, errorCB);
};

db.deleteShid = function(success_callback)
{
    database.transaction(function(tx) {
        var shid = shidCurrentGet();
        tx.executeSql('DELETE FROM sheetsdata WHERE shid='+shid);
        tx.executeSql('DELETE FROM sheetsheaders WHERE shid='+shid);
    }, errorCB, success_callback);

};
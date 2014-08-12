/*
start app
- create tables
- read file for synchronize
    if modification > then db.lastExportDate =  read data from file

- export data
    lastExportDate is set in db by date of saved file


lastSyncDate
    - when read xml si proceed lastSyncDate is set
    - on every focus a input, is get lastSyncDate from db. Value si put to memory inputValue
    - on every change is check if lastSyncDate > 30, then alert is shown and value put back from inputValue
 */

var lastRowID = 0;
var sheetCurrent = 0;
var rowUpdatedID = 0;
var categorySelectPrev = "Instructions";
var firstInsert = false;
var inputValue;
var focusStop = false;
var defaultCodeOptionsHtml = "<option>4006 &quot;Auto Expenses&quot;</option> <option>4007 &quot;Food/Sundries&quot;</option> <option>4008 &quot;Home Maintenance&quot;</option> <option>4009 &quot;Insurance&quot;</option> <option>4010 &quot;Medical&quot;</option> <option>4011 &quot;Housing&quot;</option> <option>4012 &quot;Telephone&quot;</option> <option>4013 &quot;Utilities&quot;</option> <option>4014 &quot;Open&quot;</option> <option>4015 &quot;Open&quot;</option> <option>4016 &quot;Unident ified Cash w/d&quot;</option> <option>4017 &quot;Open&quot;</option> <option>4018 &quot;Open&quot;</option> <option>4019 &quot;Oenn</option> <option>4020 &quot;Open&quot;</option> <option>4021 &quot;Open&quot;</option> <option>4517 &quot;Child#1-A&quot;</option> <option>4517 &quot;Child#2-B&quot;</option> <option>4517 &quot;Child#3-C&quot;</option> <option>4517 &quot;Child#4-D&quot;</option> <option>4517 &quot;Child#5-E&quot;</option> <option>4518 &quot;for Primary Wage Earner #1&quot;</option> <option>4519 &quot;for Primary Wage Earner #2&quot;</option> <option>4520 &quot;Pet#1-A&quot;</option> <option>4520 &quot;Pet#2-B&quot;</option> <option>4521 &quot;Open&quot;</option> <option>5023 &quot;Medical Debt / Fees / Charges&quot;</option> <option>5024 &quot;Loans &amp; Notes Payable&quot;</option> <option>5025 &quot;Tax Debt I Estimated Tax&quot;</option> <option>5026 &quot;Open&quot;</option> <option>6028 &quot;Donations/Gifts&quot;</option> <option>6029 &quot;Entertainment&quot;</option> <option>6032 &quot;Savings&quot;</option> <option>6033 &quot;Vacations&quot;</option>";
var defaultHowPaidOptionsHtml = "<option>CASH</option> <option>BK#0001</option> <option>BK#0002</option> <option>BK#0003</option> <option>BK#0004</option> <option>BK#0005</option> <option>BK#0006</option> <option>BK#0007</option> <option>BK#0008</option> <option>BK#0009</option> <option>BK#0010</option> <option>BK#9999</option> <option>CC#0001</option> <option>CC#0002</option> <option>CC#0003</option> <option>CC#0004</option> <option>CC#0005</option> <option>CC#0006</option> <option>CC#0007</option> <option>CC#0008</option> <option>CC#0009</option> <option>CC#9999</option> <option>LOC#001</option> <option>LOC#002</option> <option>LOC#003</option>";
var dbHowPaidOptionsHtml = defaultHowPaidOptionsHtml;
var testWritelData = '<data><meta><category><option>4517 &quot;Child#1-A&quot;</option><option>4007 &quot;Food/Sundries&quot;</option><option>4008 &quot;Home Maintenance&quot;</option><option>4009 &quot;Insurance&quot;</option><option>4010 &quot;Medical&quot;</option><option>4011 &quot;Housing&quot;</option><option>4012 &quot;Telephone&quot;</option><option>4013 &quot;Utilities&quot;</option><option>4014 &quot;Open&quot;</option><option>4015 &quot;Open&quot;</option><option>4016 &quot;Unident ified Cash w/d&quot;</option><option>4017 &quot;Open&quot;</option><option>4018 &quot;Open&quot;</option><option>4019 &quot;Oenn</option><option>4020 &quot;Open&quot;</option><option>4021 &quot;Open&quot;</option><option>4517 &quot;Child#1-A&quot;</option><option>4517 &quot;Child#2-B&quot;</option><option>4517 &quot;Child#3-C&quot;</option><option>4517 &quot;Child#4-D&quot;</option><option>4517 &quot;Child#5-E&quot;</option><option>4518 &quot;for Primary Wage Earner #1&quot;</option><option>4519 &quot;for Primary Wage Earner #2&quot;</option><option>4520 &quot;Pet#1-A&quot;</option><option>4520 &quot;Pet#2-B&quot;</option><option>4521 &quot;Open&quot;</option><option>5023 &quot;Medical Debt / Fees / Charges&quot;</option><option>5024 &quot;Loans &amp; Notes Payable&quot;</option><option>5025 &quot;Tax Debt I Estimated Tax&quot;</option><option>5026 &quot;Open&quot;</option><option>6028 &quot;Donations/Gifts&quot;</option><option>6029 &quot;Entertainment&quot;</option><option>6032 &quot;Savings&quot;</option><option>6033 &quot;Vacations&quot;</option><option>4006 &quot;Auto Expenses&quot;</option><option>4007 &quot;Food/Sundries&quot;</option><option>4008 &quot;Home Maintenance&quot;</option><option>4009 &quot;Insurance&quot;</option><option>4010 &quot;Medical&quot;</option><option>4011 &quot;Housing&quot;</option><option>4012 &quot;Telephone&quot;</option><option>4013 &quot;Utilities&quot;</option><option>4014 &quot;Open&quot;</option><option>4015 &quot;Open&quot;</option><option>4016 &quot;Unident ified Cash w/d&quot;</option><option>4017 &quot;Open&quot;</option><option>4018 &quot;Open&quot;</option><option>4019 &quot;Oenn</option><option>4020 &quot;Open&quot;</option><option>4021 &quot;Open&quot;</option><option>4517 &quot;Child#1-A&quot;</option><option>4517 &quot;Child#2-B&quot;</option><option>4517 &quot;Child#3-C&quot;</option><option>4517 &quot;Child#4-D&quot;</option><option>4517 &quot;Child#5-E&quot;</option><option>4518 &quot;for Primary Wage Earner #1&quot;</option><option>4519 &quot;for Primary Wage Earner #2&quot;</option><option>4520 &quot;Pet#1-A&quot;</option><option>4520 &quot;Pet#2-B&quot;</option><option>4521 &quot;Open&quot;</option><option>5023 &quot;Medical Debt / Fees / Charges&quot;</option><option>5024 &quot;Loans &amp; Notes Payable&quot;</option><option>5025 &quot;Tax Debt I Estimated Tax&quot;</option><option>5026 &quot;Open&quot;</option><option>6028 &quot;Donations/Gifts&quot;</option><option>6029 &quot;Entertainment&quot;</option><option>6032 &quot;Savings&quot;</option><option>6033 &quot;Vacations&quot;</option></category><howPaid><option>testHowPaid</option><option>CASH</option> <option>BK#0001</option> <option>BK#0002</option> <option>BK#0003</option> <option>BK#0004</option> <option>BK#0005</option> <option>BK#0006</option> <option>BK#0007</option> <option>BK#0008</option> <option>BK#0009</option> <option>BK#0010</option> <option>BK#9999</option> <option>CC#0001</option> <option>CC#0002</option> <option>CC#0003</option> <option>CC#0004</option> <option>CC#0005</option> <option>CC#0006</option> <option>CC#0007</option> <option>CC#0008</option> <option>CC#0009</option> <option>CC#9999</option> <option>LOC#001</option> <option>LOC#002</option> <option>LOC#003</option></howPaid><code><option>123 &quot;muj test&quot;</option><option>4006 &quot;Auto Expenses&quot;</option> <option>4007 &quot;Food/Sundries&quot;</option> <option>4008 &quot;Home Maintenance&quot;</option> <option>4009 &quot;Insurance&quot;</option> <option>4010 &quot;Medical&quot;</option> <option>4011 &quot;Housing&quot;</option> <option>4012 &quot;Telephone&quot;</option> <option>4013 &quot;Utilities&quot;</option> <option>4014 &quot;Open&quot;</option> <option>4015 &quot;Open&quot;</option> <option>4016 &quot;Unident ified Cash w/d&quot;</option> <option>4017 &quot;Open&quot;</option> <option>4018 &quot;Open&quot;</option> <option>4019 &quot;Oenn</option> <option>4020 &quot;Open&quot;</option> <option>4021 &quot;Open&quot;</option> <option>4517 &quot;Child#1-A&quot;</option> <option>4517 &quot;Child#2-B&quot;</option> <option>4517 &quot;Child#3-C&quot;</option> <option>4517 &quot;Child#4-D&quot;</option> <option>4517 &quot;Child#5-E&quot;</option> <option>4518 &quot;for Primary Wage Earner #1&quot;</option> <option>4519 &quot;for Primary Wage Earner #2&quot;</option> <option>4520 &quot;Pet#1-A&quot;</option> <option>4520 &quot;Pet#2-B&quot;</option> <option>4521 &quot;Open&quot;</option> <option>5023 &quot;Medical Debt / Fees / Charges&quot;</option> <option>5024 &quot;Loans &amp; Notes Payable&quot;</option> <option>5025 &quot;Tax Debt I Estimated Tax&quot;</option> <option>5026 &quot;Open&quot;</option> <option>6028 &quot;Donations/Gifts&quot;</option> <option>6029 &quot;Entertainment&quot;</option> <option>6032 &quot;Savings&quot;</option> <option>6033 &quot;Vacations&quot;</option></code></meta><sheet><header><shid>1</shid><category>t1</category><planSpend>100.00</planSpend><code>4007 "Food/Sundries"</code></header><tableData><row><rowID>1</rowID><date></date><paid>BK#0001</paid><desc>aa</desc><ref>12</ref><payment>12.00</payment><available>-12.00</available></row></tableData></sheet><sheet><header><shid>2</shid><category>t2</category><planSpend>0.00</planSpend><code>4517 "Child#1-A"</code></header><tableData><row><rowID>1</rowID><date></date><paid>BK#0002</paid><desc>neci</desc><ref></ref><payment></payment><available></available></row></tableData></sheet></data>';

var currentDate = new Date();
logging("currentDate:" + currentDate,1);
var syncDate;
syncDate = "";

function onDeviceReady()
{
    //alert("onDeviceReady");
    init();
}

function onDeviceReadyDelay()
{
    //alert("onDeviceReadyDelay");
    init();
}

function init()
{


    if(!pgReady)
    {
        pgReady = true;
    } else
    return;




    $( document ).on('change', '.content input, .content select', function() {
        if(dbUpdater2(this))
        {
            addRowCheck(this);
            focusSetNext(this);
        }
    });

    $( document ).on('click', '.instructions input', function() {
        var el = $(this);
        setTimeout(function(){
            startTable(el);
        },50)

    });

    // read date of sync from db.
    //  its because is asynchronous. So user in meanwhile user can modified and after enter it will check if is sync < 30 days
    $(document).on("click","input, select",function() {
        if ($(this).is(":focus")) {
            db.readLastSync();
            inputValue = $(this).val();
        }
    });


    $(function() {
        FastClick.attach(document.body);
    });


    // focus next field in table
    $(document).on("keypress",".content input",function(e) {
        if (e.which == 13) {

            if($(this).closest('span').hasClass("dater"))
            {
                // focus is set in dateFormatCheck()
            }
            else
            {
                //$(this).closest('span').next().find('input').focus();
                var elNext = $(this).closest('span').next().find('input');
                $(elNext).focus();
                $(elNext).click();
                //e.preventDefault();
            }

        }
    });



    $('#categorySelectNext').on('click', function() {
        if($('#categorySelect option:selected').next().val() == "New page")
        {
            return;
        }
        if($('#categorySelect > option').length<3){
            return;
        }
        $("#categorySelect > option:selected")
            .prop("selected", false)
            .next()
            .prop("selected", true);
        db.loadSheet();
    });

    $('#categorySelectPrev').on('click', function() {
        $("#categorySelect > option:selected")
            .prop("selected", false)
            .prev()
            .prop("selected", true);
        db.loadSheet();
    });


    enableMenuButton();



    db.init();
    //fileInit();
}



function newWTable()
{
    logging("newWTable",1);

    // hide instruction if you tap new Page on that
    // this code is in db.loadSheet
    if(categorySelectPrev=="Instructions")
    {
        showInstructions(false);
        $("body").css("display","block");
    }
    //newWTableRender();
    db.CreateNextTable();
    //currentWtable = lastWtable;

    $("#category").val("");
    //$("#code").val('4011 "Housing"');
    $("#code").val($("#code option:first").val());
    $("#planSpend").val("0.00");
    $("ul.content").empty();
    lastRowID  =0;
    addRow();
}

function newWTableRender()
{
    var newWtable = $("#first").html();
    newWtable = ('<div id="'+currentWtable+'" style="disply:block">'+newWtable+'</div>');
    $(".main").append(newWtable);
}

function recalculateBalance()
{
    var total = document.getElementById("planSpend").value;
    var underValue = false;
    $(".content li").each(function(){
        var payment = $(this).find(".payment input").val();
        if(payment > 0)
        {
            total = parseFloat(Math.round((total-payment) * 100) / 100).toFixed(2);
            var aviableAmountEl = $(this).find(".last input");
            $(aviableAmountEl).val(total);
            $(this).find(".last input").val(total);
            if(total>=0)
            {
                $(aviableAmountEl).css("color","black");
            } else
            {
                $(aviableAmountEl).css("color","red");
                underValue= true;
            }
        }
    });
    if(underValue) alert("Available balance is under $0");
}

function priceFormatCheck(el)
{
    value = el.value;
    var proceedUpdate = true;

    // is it positive number?
    if(isNaN(Number(value)) || Number(value)<0)
    {
        alert("This value must be positive real number");
        //$("#planSpend").val("0");
        $(el).val("0");
        proceedUpdate = false;
    }

    // has this number ".00" ?
    var elSlinc = value.split(".");
    if(elSlinc.length == 1 && proceedUpdate)
    {
        value = value + ".00";
        el.value = value;
    }

    recalculateBalance();
    db.headerUpdate();

}

function dateFormatCheck(el)
{
    value = el.value;
    if(value.length>0)
    {
        elSlinc = value.split("/");
        if(elSlinc.length < 2 || elSlinc.length > 3)
        {
            alert("Date format must be: 'M/D' or M/D/YY");
            $(el).val("");
            return;
        }
    }
    $(el).closest('span').next().find('input').focus();
}

function addRowCheck(el)
{
    var thisRowID = $(el).parent().parent().attr("data-id");
    if(thisRowID == lastRowID)
    {
        addRow();
    }

}

function addRow()
{
    logging("addRow",1);
    lastRowID ++;

    $("ul.content").append('<li data-id="'+lastRowID+'"> <span class="dater"><input onchange="dateFormatCheck(this)"></span> <span  class="paid"><select>'+dbHowPaidOptionsHtml+'</select></span> <span class="description"><input></span> <span class="checkRef"><input></span> <span class="payment"><input onchange="priceFormatCheck(this)"></span> <span class="last"><input readonly></span> </li>');

    //date picker (without dateFormatCheck()) dont work on Android
    //$("ul.content").append('<li data-id="'+lastRowID+'"> <span class="dater"><input type="date" required="required"></span> <span  class="paid"><select>'+dbHowPaidOptionsHtml+'</select></span> <span class="description"><input></span> <span class="checkRef"><input></span> <span class="payment"><input onchange="priceFormatCheck(this)"></span> <span class="last"><input readonly></span> </li>');
}

function updateHeader()
{
    var proceedUpdate = true;
    var category = $("#category").val();
    var code = $("#code option:selected").text();
    var planSpend = $("#planSpend").val();

    // fields validation
    if(isNaN(Number(planSpend)))
    {
        alert("Plan to spend must be positive real number");
        $("#planSpend").val("0");
        proceedUpdate = false;
    }

    if(proceedUpdate) dbUpdateHeader();
}


function categorySelectonchange()
{
    if($("#categorySelect").val()=="New page")
    {
        newWTable();
    }
        else
    {
        db.loadSheet();db.setOpenedSheet();memPrev()
    }

}
function categorySelectUpdate()
{
    $( "#categorySelect option:selected" ).text($('#category').val());
}

function buttonDelete()
{
    if($("#categorySelect option:selected").val()=="Instructions")
        return;

    var r = confirm("Do you want to delete this page and all data?");
    if (r == true) {
        db.deleteShid(deleteAfterSelectCategory);
    } else {
        return;
    }
}

function deleteAfterSelectCategory()
{
    $("#categorySelect option[value="+shidCurrentGet()+"]").remove();
    if($('#categorySelect > option').length<3){
        //$("categorySelect").prop('selectedIndex', 1);
        $('#categorySelect :nth-child(1)').prop('selected', true);

    } else
    {
        $('#categorySelect :nth-child(2)').prop('selected', true);
    }
    db.loadSheet();
}

function buttonSave()
{
    //alert("I will preform save");
    manualySave= true;
    generateXML("write");
}

function shidCurrentGet()
{
    return $("#categorySelect option:selected").val();
}

function dbUpdater2(el)
{
    var run = true;
    if(!lastSyncOK())
    {
        $(el).val(inputValue);
        run = false;
    } else
    {
        rowUpdatedID = $(el).parent().parent().attr("data-id");
        db.rowUpdateInsert();
        //db.transaction(dbUpdateQ, errorCB);
    }
    return run;
}

function startTable(el)
{
    $(el).prop('checked', false);
    var code = $(el).next().next().html();
    //$(".instructions div.pickUp").html("");
    showInstructions(false);

    newWTable();

    $("#code option:contains(" + code + ")").attr('selected', 'selected');
    //$("#code option:selected").text(code);

    //db.transaction(dbUpdateQ, errorCB);
}

function showInstructions(yesnNo)
{
    logging("showInstructions: "+yesnNo,1);
    if(yesnNo)
    {
        // show instructions
        //$("div.topMenu").css("display","none");
        $("div.sheets").css("display","none");
        $("div.instructions").css("display","block");
    } else
    {
        $("div.topMenu").css("display","block");
        $("div.sheets").css("display","block");
        $("div.instructions").css("display","none");
    }

}
function showInstructionsCodes()  // zruseno
{
    $("div.instruction").append("<div class='checkboxes'>");
    $("#code option").each(function()
    {
        $(".instructions div.pickUp").append('<input type="checkbox" value="'+$(this).text()+'"><span>'+$(this).text()+'</span><br>');

    });
}

function codesSetDefaults()
{
    var i =0;
    $("#code").append(defaultCodeOptionsHtml);

    $("div.instruction").append("<div class='checkboxes'>");
    $("#code option").each(function()
    {
        $(".instructions div.pickUp").append('<input id="instCheck'+i+'" type="checkbox" value="'+$(this).text()+'"><label class="checkboxFive" for="instCheck'+i+'"></label><span>'+$(this).text()+'</span><br>');
        i++;
    });
}

function memPrev()
{
    categorySelectPrev = $("#categorySelect option:selected").val();
}

function lastSyncOK()
{
    var state = true;
    console.log("last read:" + lastSyncDate);
    if(lastSyncDate!=null)
    {
        currentDate = new Date();
        var ar = lastSyncDate.split("-");
        d_lastExportDate = new Date(ar[0],ar[1]-1,ar[2],ar[3],ar[4]);
        var oneDay = 24*60*60*1000;
        var diffDays = Math.round(Math.abs((currentDate.getTime() - d_lastExportDate.getTime())/(oneDay)));
        //diffDays = 50;
        if(diffDays>31)
        {
            alert('You have used up your "i-Count" Companion for the month. Please synchronize with your Money Manager, or contact KMD "i-Count" Systems');
            state = false;
        }
    }


    firstInsert = true;
    return state;

}

function focusSetNext(el)
{
    // if you in table, set focus on next field
    // $(el).parent().siblings('div.bottom').find("input.post").focus();
}



//-------------------------------------------------------------------
// level: 1=INFO, 2=WARNING, 3=ERROR
function logging(str, level) {
    if (level == 1) console.log("INFO:" + str);
    if (level == 2) console.log("WARN:" + str);
    if (level == 3) alert("ERROR:" + str);
    if(loggingAlert) alert(str);

    var elLog = $("#log");
    if(elLog.length>0)
    {
        var elTextarea = $("#log").find("textarea");
        var text= $(elTextarea).val();
        text += str + "\n";
        $(elTextarea).val(text);
        $(elTextarea).scrollTop($(elTextarea)[0].scrollHeight);
    }
};


function StringtoXML(text){
    if (window.ActiveXObject){
        var doc=new ActiveXObject('Microsoft.XMLDOM');
        doc.async='false';
        doc.loadXML(text);
    } else {
        var parser=new DOMParser();
        var doc=parser.parseFromString(text,'text/xml');
    }
    return doc;
}

// ---- menu button
function enableMenuButton()
{
    document.addEventListener("menubutton", menuButton, true);
}

function menuButton() {
    $("#log").toggle();
}
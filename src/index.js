
// Constants for DOM elements
const cBtnSubmit = document.getElementById("btnSubmit");
const cBtnShowHistory = document.getElementById("btnShowHistory");
const cPunchHistory = document.getElementById("punchHistory");
const cActionMessage = document.getElementById("actionMessage");
const defaultURL = 'http://localhost:3000/timeCard';
let timeCardObj = {};

cBtnShowHistory.textContent = "Show History";
let showPunchHistoryDisplay = false;

//Set up event listeners after document is loaded
document.addEventListener("DOMContentLoaded", async () => {
    const cDay = document.getElementById("dayPunch");
    const cTimePunchIn = document.getElementById("timePunchIn");
    const cTimePunchOut = document.getElementById("timePunchOut");
    
    //Set action messages for day/time entry
    cDay.addEventListener("focus", async () => {
        showActionMessage(`editing day...`);
    });
    cTimePunchIn.addEventListener("focus", () => showActionMessage("editing clock-in time..."));
    cTimePunchOut.addEventListener("focus", () => showActionMessage("editing clock-out time..."));
    
    cDay.addEventListener("focusout", () => showActionMessage(`day set to [${cDay.value}]`));
    cTimePunchIn.addEventListener("focusout", () => showActionMessage(`clock-in time set to [${cTimePunchIn.value}]`));
    cTimePunchOut.addEventListener("focusout", () => showActionMessage(`clock-out time set to [${cTimePunchOut.value}]`));   
    
    //Submit Punch
    cBtnSubmit.addEventListener("click", async () => {
        
        const punchDay = cDay.value;
        const timeIn = cTimePunchIn.value;
        const timeOut = cTimePunchOut.value;
        
        const cBody = {
            "day": punchDay,
            "timeIn" : timeIn,
            "timeOut" : timeOut
        };
        
        submitPunch(cBody, `${cBody["timeIn"]} to ${cBody["timeOut"]}`);        
    });
    
    //Show Punch history
    cBtnShowHistory.addEventListener("click", async () => {
        if (!showPunchHistoryDisplay){
            refreshPunchHistory();
            cBtnShowHistory.textContent = "Hide History";
            cPunchHistory.style.display = "block";
            showPunchHistoryDisplay = true;
        } else {
            cBtnShowHistory.textContent = "Show History";
            cPunchHistory.style.display = "none";
            showPunchHistoryDisplay = false;
        }
    });
    
});

//Refresh punch history
async function refreshPunchHistory() {
    
    showActionMessage(``);
    
    cPunchHistory.textContent = "";
    await fetchRequest(`${defaultURL}/punches`);
    
    //Convert timeCard Object to Array
    const punchArray = ObjToArray(timeCardObj);
    
    await fetchRequest(`${defaultURL}/days`);
    let dayArray = ObjToArray(timeCardObj);
    
    //Sort days from oldest to newest
    dayArray.sort(compareDays);
    
    //Day Loop
    dayArray.forEach(day => {
        const tblElement = document.createElement("table");
        tblElement.className = "table";
        
        const dayId = day["id"];
        
        const rowHeader = tblElement.createTHead();
        rowHeader.innerHTML = `<b>${ new Date(`${day["day"].toString().replace('-','/')}`).toLocaleDateString('en-US')}</b>`;
        // rowHeader.innerHTML = `<b>${ new Date(`${day["day"]}`).toDateString('en-US')}</b>`;
        
        const row0 = tblElement.insertRow();
        const cell0 = row0.insertCell();
        const cell00 = row0.insertCell();
        cell0.innerHTML = `<b>Clock-In</b>`;
        cell00.innerHTML = `<b>Clock-Out</b>`;
        
        //Punch Loop
        //Filter punches for current day in [dayArray] 
        punchArray.filter(cDay => cDay["day"] === day["day"] )
        .forEach(punch => {
            const punchId = punch["id"];
            const row1 = tblElement.insertRow();
            const cell1 = row1.insertCell();
            const cell2 = row1.insertCell();
            const cell3 = row1.insertCell();
            cell1.innerHTML = `${punch["timeIn"] ? punch["timeIn"]: ""}`;
            cell2.innerHTML = `${punch["timeOut"] ? punch["timeOut"]: ""}`;
            cell1.className = "td";
            cell2.className = "td";
            
            //Add delete punch button
            const btnDeletePunch = document.createElement("button");
            btnDeletePunch.id = `btnDeletePunch_${dayId}_${punchId}`;
            btnDeletePunch.textContent = `Delete`;
            btnDeletePunch.addEventListener("click", () => deletePunch(punchId, null, `${cell1.textContent ? cell1.textContent: "null"} to ${cell2.textContent? cell2.textContent: "null"} on ${rowHeader.textContent}`));
            cell3.append(btnDeletePunch);
            
            cPunchHistory.append(tblElement);
        });
        
    });
}

//Submit Punch
async function submitPunch(cBody, punchInfo) {
    if(await isValidTimeEntry(cBody["day"], cBody["timeIn"], cBody["timeOut"])) {
        if(confirm(`Are you sure you want to submit the punch from ${punchInfo}?`)) {
            if (await addDay(cBody["day"])) {                
                cBody["timeIn"] = new Date(`${cBody["day"]} ${cBody["timeIn"]}`).toLocaleTimeString('en-US');
                cBody["timeOut"] = new Date(`${cBody["day"]} ${cBody["timeOut"]}`).toLocaleTimeString('en-US');
                
                const configSettings = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(cBody)
                };
                
                const result = await fetchRequest(`${defaultURL}/punches`, configSettings)
                if(result.status === 201) {
                    alert(`Punch added successfully!`);
                    console.log("Punch added", cBody);
                    
                    if(!showPunchHistoryDisplay) {
                        cBtnShowHistory.click();
                    } else {
                        refreshPunchHistory();
                    }
                    
                    //Set action message after punch submission
                    showActionMessage(`punch submitted for ${cBody["day"]} from ${cBody["timeIn"]} to ${cBody["timeOut"]}`);
                }
                else {
                    alert(`An error occurred!`)
                }
            }        
        }
    }
}

//Delete Punch
async function deletePunch(punchId, cBody, punchInfo) {        
    if(confirm(`Are you sure you want to delete the punch from ${punchInfo}?`)) {
        const configSettings = {
            method: 'DELETE',
            headers:
            {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: cBody ? JSON.stringify(cBody) : null
        };
        
        const result = await fetchRequest(`${defaultURL}/punches/${punchId}`, configSettings)
        if(result.status === 200) {
            alert(`Punch deleted!`)
            refreshPunchHistory();

            //Set action message after punch submission
            showActionMessage(`time entry deleted [${punchInfo}]`);
        }
        else {
            alert(`An error occurred!`)
            //console.log(result);
        }
        
    }
}

//Validate Punch data
async function isValidTimeEntry(day, timeIn, timeOut) {
    if(!day) {
        alert("Please enter a day");
        showActionMessage("Invalid day");
        return false;
    }
    if(!timeIn) {
        alert("Please enter Clock-In time");
        showActionMessage("Invalid Clock-In time");
        return false;
    }
    if(!timeOut) {
        alert("Please enter Clock-Out time");
        showActionMessage("Invalid Clock-Out time");
        return false;
    }
    
    //Verify Clock-Out time is greater than Clock-In time
    if(timeOut <= timeIn) {
        alert("Clock-In time must be earlier than Clock-Out time");
        showActionMessage("Invalid punch entry. ", "timeIn:", timeIn, "timeOut:", timeOut  );
        return false;
    }
    
    await fetchRequest(`${defaultURL}/punches`);
    const punchArray = ObjToArray(timeCardObj);
    
    //Check if there's a more recent time entry on the same day
    if(punchArray.filter(punch => punch["day"] === day)
    .find(punch => new Date(`${day} ${timeIn}`).getTime() < new Date(`${day} ${punch["timeOut"]}`).getTime())) {
        alert("Time entry cannot come before any existing entries on the same day");
        return false;
    }
    
    return true;
}

//Check if day exists and add day if it doesn't
async function addDay(day) {
    
    await fetchRequest(`${defaultURL}/punches`);
    const dayArray = ObjToArray(timeCardObj);
    
    if(!dayArray.find(days => days["day"] == day)) {
        const cBody = { "day": day }
        
        const configSettings = {
            method: "POST",
            headers:
            {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cBody)
        }
        
        const result = await fetchRequest(`${defaultURL}/days`, configSettings);
        
        if(result.status === 201) {
            console.log(`New day created`, `[${day}]`)
        }
        else {
            alert(`An error occurred!`)
            console.log(result);
            return false;
        }
    }
    return true;
}

//Day comparison function for sorting
function compareDays(day1Array, day2Array) {
    if (day1Array["day"] < day2Array["day"])
    return -1;
    else if (day1Array["day"] === day2Array["day"])
    return 0;
    else if (day1Array["day"] > day2Array["day"])
    return 1;
};

//Generic Fetch request
async function fetchRequest(url, configSettings) {
    let result;
    
    await fetch(url, configSettings)
    .then(response => {result = response; return response.json() })
    .then(data => {
        timeCardObj = data;
    })
    .catch(err => {
        console.log(err);
        alert("Server Error!");
    });
    return result;
}

// Function to show action messages
function showActionMessage(message) {
    cActionMessage.textContent = message;
}

//Convert Object to Array
function ObjToArray(obj){
    return Object.keys(obj).map(element => obj[element]);
}

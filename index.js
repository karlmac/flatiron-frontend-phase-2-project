//PENDING:
//Add submit punch functionality (also submit to /days endpoint if selected day is not present) - cBtnSubmit=>submitPunch
//Add clock API to get current date/time
//Use find() method to find the last punch time - cLastPunchMsg

const cLastPunchMsg = document.getElementById("lastPunchMsg");
const cBtnSubmit = document.getElementById("btnSubmit");
const cBtnShowHistory = document.getElementById("btnShowHistory");
const cPunchHistory = document.getElementById("punchHistory");
const defaultURL = 'http://localhost:3000/timeCard';
let timeCardObj = {};

cBtnShowHistory.textContent = "Show History";
let showPunchHistoryDisplay = false;

document.addEventListener("DOMContentLoaded", async () => {
    //Get Last Punch info
    cLastPunchMsg.textContent = `Last clocked ${"#in/out#"} at ${"#00:00 AM#"}`;
    
    //Submit Punch
    cBtnSubmit.addEventListener("click", async () => {
        const cDay = document.getElementById("dayPunch");
        const cTimePunchIn = document.getElementById("timePunchIn");
        const cTimePunchOut = document.getElementById("timePunchOut");
        
        const timeIn = cTimePunchIn.value;
        const timeOut = cTimePunchOut.value;
        
        const cBody = {
            "day": cDay,
            "timeIn" : timeIn,
            "timeOut" : timeOut
        };
        
        submitPunch(cBody, `${cBody["timeIn"]} to ${cBody["timetimeOutIn"]}`)
        
        console.log(punchTime);
        
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
    
    cPunchHistory.textContent = "";
    
    await fetchRequest(`${defaultURL}/punches`);
    
    //Convert timeCard Object to Array
    const punchArray = ObjToArray(timeCardObj);// Object.keys(timeCardObj).map(element => timeCardObj[element]);
    
    await fetchRequest(`${defaultURL}/days`);
    const dayArray = ObjToArray(timeCardObj);
    
    //Day Loop
    dayArray.forEach(day => {
        const tblElement = document.createElement("table");
        tblElement.className = "table";
        
        const dayId = day["id"];
        //console.log(punch);
        
        const rowHeader = tblElement.createTHead();
        rowHeader.innerHTML = `<b>${day["day"]}</b>`;
        
        const row0 = tblElement.insertRow();
        const cell0 = row0.insertCell();
        const cell00 = row0.insertCell();
        cell0.innerHTML = `<b>Clock-In</b>`;
        cell00.innerHTML = `<b>Clock-Out</b>`;
        
        //Punch Loop
        //Filter punches for current day from [dayArray] 
        punchArray.filter(cDay => cDay["day"] === day["day"] )
        .forEach(punch => {
            const punchId = punch["id"];
            const row1 = tblElement.insertRow();
            const cell1 = row1.insertCell();
            const cell2 = row1.insertCell();
            const cell3 = row1.insertCell();
            cell1.innerHTML = `${punch["timeIn"] ? punch["timeIn"]: ""}`;
            cell2.innerHTML = `${punch["timeOut"] ? punch["timeOut"]: ""}`;
            
            //Add delete punch button
            const btnDeletePunch = document.createElement("button");
            btnDeletePunch.id = `btnDeletePunch_${dayId}_${punchId}`;
            btnDeletePunch.textContent = `Delete`;
            btnDeletePunch.addEventListener("click", () => deletePunch(punchId, null, `${cell1.textContent ? cell1.textContent: "\"undefined\""} to ${cell2.textContent? cell2.textContent: "\"undefined\""} on ${rowHeader.textContent}`));
            cell3.append(btnDeletePunch);
            
            cPunchHistory.append(tblElement);
        });
        
    });
    
    //console.log(timeCardObj);
}

//Submit Punch
async function submitPunch(cBody, punchInfo) {        
    if(confirm(`Are you sure you want to submit the punch from ${punchInfo}?`)) {

        if(isValidTimeEntry(cBody["day"], cBody["timeIn"], cBody["timeOut"],)) {
            const configSettings = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(cBody)
            };
            
            const result = await fetchRequest(`${defaultURL}/punches`);//, configSettings)
            if(result.status === 200) {
                alert(`Punch added successfully!`)
            }
            else {
                alert(`An error occurred!`)
                //console.log(result);
            }
        }
        
        refreshPunchHistory();
    }
}
//Validate Punch data
async function isValidTimeEntry(day, timeIn, timeOut) {
    if(!day) {
        alert("Please enter a day");
        return false;
    }
    if(!timeIn) {
        alert("Please enter Clock-In time");
        return false;
    }
    if(!timeOut) {
        alert("Please enter Clock-Out time");
        return false;
    }
    
    //Verify Clock-Out time is greater than Clock-In time
    if(timeOut <= timeIn) {
        alert("Clock-In time must be older than Clock-Out time");
        return false;
    }
    
    await fetchRequest(`${defaultURL}/punches`);
    const punchArray = ObjToArray(timeCardObj);
    
    //Check if day exists and add day if it doesn't
    if(punchArray.find(punch => punch["day"] !== day)) {
        const cBody = { "day": day }
        
        const configSettings = {
            method: "PUT",
            header:
            {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cBody)
        }
        
        await fetchRequest(`${defaultURL}/days`, configSettings);
        
        return true;
    }
    
    //Check if there's a more recent entry on the same day
    if(punchArray.filter(punch => punch["day"] === day).find(punch => timeIn <= punch["timeOut"])) {
        alert("Time entry cannot be older than any existing entries for the same day");
        return false;
    }
    
    return true;
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
        }
        else {
            alert(`An error occurred!`)
            //console.log(result);
        }
        
        refreshPunchHistory();
    }
}

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

//Convert Object to Array
function ObjToArray(obj){
    return Object.keys(obj).map(element => obj[element]);
}
//PENDING: Use find to find the last punch time

const cLastPunchMsg = document.getElementById("lastPunchMsg");
const cTimePunch = document.getElementById("timePunch");
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
    cBtnSubmit.addEventListener("click", () => { 
        const punchTime = cTimePunch.value;
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

    await fetchRequest(defaultURL);
    cPunchHistory.textContent = "";
            
    //Convert timeCard Object to Array
    const timeCardArray = Object.keys(timeCardObj).map(element => timeCardObj[element]);// [];
    
    //for(i =0; i< timeCardArray.length; i++) {
    timeCardArray.forEach(timeCard => {
        //console.log(timeCardArray[i]["id"]);
        //cTable += timeCardArray[i]["day"];
        const tblElement = document.createElement("table");
        
        const punches = timeCard["punches"];
        const cardId = timeCard["id"];

        const rowHeader = tblElement.createTHead();
        //const cell0 = rowHeader.insertCell();
        rowHeader.innerHTML = `<b>${timeCard["day"]}</b>`;
        
        const row0 = tblElement.insertRow();
        const cell0 = row0.insertCell();
        const cell00 = row0.insertCell();
        cell0.innerHTML = `<b>Clock-In</b>`;
        cell00.innerHTML = `<b>Clock-Out</b>`;
        
        // alert(timeCardArray.keys());
        // const punchesArray = timeCardArray.values();
        // punchesArray.forEach(element => {
        //     console.log(element + " - array");
        // });
        
        for(i =0; i< punches.length; i++) {
            //console.log(`Clock-In: ${punches[j]["timeIn"]} - Clock-Out: ${punches[j]["timeOut"]}`);
            const punchId = punches[i]["id"];
            const row1 = tblElement.insertRow();
            const cell1 = row1.insertCell();
            const cell2 = row1.insertCell();
            const cell3 = row1.insertCell();
            cell1.innerHTML = `${punches[i]["timeIn"] ? punches[i]["timeIn"]: ""}`;
            cell2.innerHTML = `${punches[i]["timeOut"] ? punches[i]["timeOut"]: ""}`;
            
            const cBody = {
                id: punchId
            };

            //Add delete punch button
            const btnDeletePunch = document.createElement("button");
            btnDeletePunch.id = `btnDeletePunch_${cardId}_${punchId}`;
            btnDeletePunch.textContent = `Delete`;
            btnDeletePunch.addEventListener("click", () => deletePunch(cardId, cBody,
                `${cell1.textContent ? cell1.textContent: "\"undefined\""} to ${cell2.textContent? cell2.textContent: "\"undefined\""} on ${rowHeader.textContent}`));                
            cell3.append(btnDeletePunch);
        };
        cPunchHistory.append(tblElement);
        
    });
    
    //console.log(timeCardObj);
}

//Delete Punch
async function deletePunch(cardId, cBody, punchInfo) {
    //alert(cardId); alert(cBody);
    
    if(confirm(`Are you sure you want to delete the punch from ${punchInfo}?`))
    {
        const configSettings = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cBody)
        };
        
        await fetchRequest(`${defaultURL}/${cardId}`, configSettings);
        alert(`Punch deleted`);
    }
}


//Generic Fetch request
async function fetchRequest(url, configSettings) {
    await fetch(url, configSettings)
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        timeCardObj = data;
    })
    .catch(err => {
        console.log(err);
        alert("Server Error!");
    });
    return timeCardObj;
}

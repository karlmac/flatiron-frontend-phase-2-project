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
    cBtnSubmit.addEventListener("click", async () => { 
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
    
    cPunchHistory.textContent = "";
    
    await fetchRequest(`${defaultURL}/punches`);
    
    //Convert timeCard Object to Array
    const punchArray = Object.keys(timeCardObj).map(element => timeCardObj[element]);
    
    await fetchRequest(`${defaultURL}/days`);
    const dayArray = Object.keys(timeCardObj).map(element => timeCardObj[element]);
    
    //Day Loop
    dayArray.forEach(day => {
        const tblElement = document.createElement("table");
        //console.log("day", day["day"]);
        
                const cardId = day["id"];
                //console.log(punch);
                
                const rowHeader = tblElement.createTHead();
                //const cell0 = rowHeader.insertCell();
                rowHeader.innerHTML = `<b>${day["day"]}</b>`;
                
                const row0 = tblElement.insertRow();
                const cell0 = row0.insertCell();
                const cell00 = row0.insertCell();
                cell0.innerHTML = `<b>Clock-In</b>`;
                cell00.innerHTML = `<b>Clock-Out</b>`;

        //Punch Loop
        punchArray.forEach(punch => {           
            if(punch["day"] === day["day"]) {

                
                
                ///*for(i =0; i < 0; i++) {
                    const punchId = punch["id"];
                    const row1 = tblElement.insertRow();
                    const cell1 = row1.insertCell();
                    const cell2 = row1.insertCell();
                    const cell3 = row1.insertCell();
                    cell1.innerHTML = `${punch["timeIn"] ? punch["timeIn"]: ""}`;
                    cell2.innerHTML = `${punch["timeOut"] ? punch["timeOut"]: ""}`;
                    
                    const cBody = {
                    };
                    
                    //Add delete punch button
                    const btnDeletePunch = document.createElement("button");
                    btnDeletePunch.id = `btnDeletePunch_${cardId}_${punchId}`;
                    btnDeletePunch.textContent = `Delete`;
                    btnDeletePunch.addEventListener("click", () => deletePunch(punchId, cBody,
                        `${cell1.textContent ? cell1.textContent: "\"undefined\""} to ${cell2.textContent? cell2.textContent: "\"undefined\""} on ${rowHeader.textContent}`));                
                        cell3.append(btnDeletePunch);
                    //};*/
                    
                    cPunchHistory.append(tblElement);
                    
                    
                }});
                
            });
            
            //console.log(timeCardObj);
        }
        
        //Delete Punch
        async function deletePunch(punchId, cBody, punchInfo) {
            
            //console.log("cardId", punchId, "cBody", cBody);
            
            if(confirm(`Are you sure you want to delete the punch from ${punchInfo}?`))
            {
                const configSettings = {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(cBody)
                };
                
                const result = await fetchRequest(`${defaultURL}/punches/${punchId}`, configSettings)
                if(result.status === 200) {
                    alert(`Punch deleted`)
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
        
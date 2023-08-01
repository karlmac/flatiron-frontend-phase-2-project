
const cLastPunchMsg = document.getElementById("lastPunchMsg");
const cTimePunch = document.getElementById("timePunch");
const cBtnSubmit = document.getElementById("btnSubmit");
const cBtnShowHistory = document.getElementById("btnShowHistory");
const cPunchHistory = document.getElementById("punchHistory");
const defaultURL = 'http://localhost:3000/timeCard';
let timeCardArray = {};

document.addEventListener("DOMContentLoaded", async () => {
    /*
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeCards)
    }  
    */
    //Get Last Punch info
    cLastPunchMsg.textContent = `Last clocked ${"#in/out#"} at ${"#00:00 AM#"}`;
    
    //Submit Punch
    cBtnSubmit.addEventListener("click", () => { 
        const punchTime = cTimePunch.value;
        //alert(punchTime);
        
    })
    
    //Show Punch history
    cBtnShowHistory.addEventListener("click", async () => {
        await fetchRequest(defaultURL);
        cPunchHistory.textContent = "";
        
        for(i =0; i< timeCardArray.length; i++) {
            //console.log(timeCardArray[i]["id"]);
            //cTable += timeCardArray[i]["day"];
            const tblElement = document.createElement("table");
            
            const punches = timeCardArray[i]["punches"];
            
            const rowHeader = tblElement.createTHead();
            //const cell0 = rowHeader.insertCell();
            rowHeader.innerHTML = `<b>${timeCardArray[i]["day"]}</b>`;
            
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
            
            for(j =0; j< punches.length; j++) {
                //console.log(`Clock-In: ${punches[j]["timeIn"]} - Clock-Out: ${punches[j]["timeOut"]}`);
                
                const row1 = tblElement.insertRow();
                const cell1 = row1.insertCell();
                const cell2 = row1.insertCell();
                cell1.innerHTML = `${punches[j]["timeIn"] ? punches[j]["timeIn"]: ""}`;
                cell2.innerHTML = `${punches[j]["timeOut"] ? punches[j]["timeOut"]: ""}`;
            };
            cPunchHistory.append(tblElement);
            
            
        };
        
        console.log(timeCardArray);
        
    });
    
});

//Generic Fetch request
async function fetchRequest(url, configSettings) {
    await fetch(url, configSettings)
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        timeCardArray = data;
    })
    .catch(err => {
        console.log(err);
        alert("Server Error!");
    });
    return timeCardArray;
}

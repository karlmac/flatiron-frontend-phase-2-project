import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class TimeCardApp extends Component {
  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      day: '',            // To store the selected day
      timeIn: '',         // To store the clock-in time
      timeOut: '',        // To store the clock-out time
      punchHistory: [],   // To store the punch history (an array of objects)
      showPunchHistory: false, // To control the display of punch history
      actionMessage: '',  // To display action messages
    };

  // Constants for DOM elements
    this.cBtnSubmit = null;
    this.cBtnShowHistory = null;
    this.cPunchHistory = null;
    this.cActionMessage = null;
    this.defaultURL = 'http://localhost:3000/timeCard';
    this.timeCardObj = {};

  }


  componentDidMount() {
    
    this.cBtnSubmit = document.getElementById("btnSubmit");
    this.cBtnShowHistory = document.getElementById("btnShowHistory");
    this.cPunchHistory = document.getElementById("punchHistory");
    this.cActionMessage = document.getElementById("actionMessage");

    this.cBtnShowHistory.textContent = "Show History";
    let showPunchHistoryDisplay = false;

    // Set up event listeners
    const cDay = document.getElementById("dayPunch");
    const cTimePunchIn = document.getElementById("timePunchIn");
    const cTimePunchOut = document.getElementById("timePunchOut");

    // Event listeners for input fields
    cDay.addEventListener("focus", () => this.showActionMessage("Editing day..."));
    cTimePunchIn.addEventListener("focus", () => this.showActionMessage("Editing clock-in time..."));
    cTimePunchOut.addEventListener("focus", () => this.showActionMessage("Editing clock-out time..."));

    cDay.addEventListener("focusout", () => this.showActionMessage(`Day set to [${cDay.value}]`));
    cTimePunchIn.addEventListener("focusout", () => this.showActionMessage(`Clock-in time set to [${cTimePunchIn.value}]`));
    cTimePunchOut.addEventListener("focusout", () => this.showActionMessage(`Clock-out time set to [${cTimePunchOut.value}]`));

    // Event listener for submit button
    this.cBtnSubmit.addEventListener("click", this.handleSubmit);

    // Event listener for show history button
    this.cBtnShowHistory.addEventListener("click", () => {
      if (!showPunchHistoryDisplay) {
        this.refreshPunchHistory();
        this.cBtnShowHistory.textContent = "Hide History";
        this.cPunchHistory.style.display = "block";
        showPunchHistoryDisplay = true;
      } else {
        this.cBtnShowHistory.textContent = "Show History";
        this.cPunchHistory.style.display = "none";
        showPunchHistoryDisplay = false;
      }
    });
  }

  // Event handler for day input change
  handleDayChange = (event) => {
    this.setState({ day: event.target.value });
  };

  // Event handler for time in input change
  handleTimeInChange = (event) => {
    this.setState({ timeIn: event.target.value });
  };

  // Event handler for time out input change
  handleTimeOutChange = (event) => {
    this.setState({ timeOut: event.target.value });
  };

  // Event handler for submitting a punch
  handleSubmit = async () => {
    const punchDay = this.state.day;
    const timeIn = this.state.timeIn;
    const timeOut = this.state.timeOut;

    const cBody = {
      day: punchDay,
      timeIn: timeIn,
      timeOut: timeOut,
    };

    // Call submitPunch method
    if (await this.isValidTimeEntry(cBody.day, cBody.timeIn, cBody.timeOut)) {
      if (window.confirm(`Are you sure you want to submit the punch from ${cBody.timeIn} to ${cBody.timeOut}?`)) {
        if (await this.addDay(cBody.day)) {
          cBody.timeIn = new Date(`${cBody.day} ${cBody.timeIn}`).toLocaleTimeString('en-US');
          cBody.timeOut = new Date(`${cBody.day} ${cBody.timeOut}`).toLocaleTimeString('en-US');

          const configSettings = {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(cBody)
          };

          const result = await this.fetchRequest(`${this.defaultURL}/punches`, configSettings);

          if (result.status === 201) {
            alert(`Punch added successfully!`);
            if (!this.state.showPunchHistory) {
              this.togglePunchHistory();
            } else {
              this.refreshPunchHistory();
            }
            this.showActionMessage(`Punch submitted for ${cBody.day} from ${cBody.timeIn} to ${cBody.timeOut}`);
          } else {
            alert(`An error occurred!`);
          }
        }
      }
    }

  };

//Delete Punch
deletePunch = async (punchId, cBody, punchInfo) => {        
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
      
      const result = await this.fetchRequest(`${this.defaultURL}/punches/${punchId}`, configSettings)
      if(result.status === 200) {
          alert(`Punch deleted!`)
          this.refreshPunchHistory();

          //Set action message after punch submission
          this.showActionMessage(`time entry deleted [${punchInfo}]`);
      }
      else {
          alert(`An error occurred!`)
          //console.log(result);
      }      
  }
}

  // Event handler for showing/hiding punch history
  togglePunchHistory = () => {
    this.setState((prevState) => ({
      showPunchHistory: !prevState.showPunchHistory,
    }));
    if (!this.state.showPunchHistory) {
      this.refreshPunchHistory();
    }
  };

  // Fetch punch history and update state
  fetchPunchHistory = async () => {
    await this.fetchRequest(`${this.defaultURL}/punches`);
    const punchArray = this.ObjToArray(this.timeCardObj);
  
    await this.fetchRequest(`${this.defaultURL}/days`);
    let dayArray = this.ObjToArray(this.timeCardObj);
  
    dayArray.sort(this.compareDays);
  
    this.setState({
      punchHistory: punchArray,
    });
  };

  
//Refresh punch history
refreshPunchHistory = async () => {
    
  this.showActionMessage(``);
  
  this.cPunchHistory.textContent = "";
  await this.fetchRequest(`${this.defaultURL}/punches`);
  
  //Convert timeCard Object to Array
  const punchArray = this.ObjToArray(this.timeCardObj);
  
  await this.fetchRequest(`${this.defaultURL}/days`);
  let dayArray = this.ObjToArray(this.timeCardObj);
  
  //Sort days from oldest to newest
  dayArray.sort(this.compareDays);
  
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
          btnDeletePunch.addEventListener("click", () => this.deletePunch(punchId, null, `${cell1.textContent ? cell1.textContent: "null"} to ${cell2.textContent? cell2.textContent: "null"} on ${rowHeader.textContent}`));
          cell3.append(btnDeletePunch);
          
          this.cPunchHistory.append(tblElement);
      });
      
  });
}

  //Generic Fetch request
  fetchRequest = async (url, configSettings) => {
  let result;
  
  await fetch(url, configSettings)
  .then(response => {result = response; return response.json() })
  .then(data => {
      this.timeCardObj = data;
  })
  .catch(err => {
      console.log(err);
      alert("Server Error!");
  });
  return result;
}

//Validate Punch data
 isValidTimeEntry = async (day, timeIn, timeOut) => {
  if(!day) {
      alert("Please enter a day");
      this.showActionMessage("Invalid day");
      return false;
  }
  if(!timeIn) {
      alert("Please enter Clock-In time");
      this.showActionMessage("Invalid Clock-In time");
      return false;
  }
  if(!timeOut) {
      alert("Please enter Clock-Out time");
      this.showActionMessage("Invalid Clock-Out time");
      return false;
  }
  
  //Verify Clock-Out time is greater than Clock-In time
  if(timeOut <= timeIn) {
      alert("Clock-In time must be earlier than Clock-Out time");
      this.showActionMessage("Invalid punch entry. ", "timeIn:", timeIn, "timeOut:", timeOut  );
      return false;
  }
  
  await this.fetchRequest(`${this.defaultURL}/punches`);
  const punchArray = this.ObjToArray(this.timeCardObj);
  
  //Check if there's a more recent time entry on the same day
  if(punchArray.filter(punch => punch["day"] === day)
  .find(punch => new Date(`${day} ${timeIn}`).getTime() < new Date(`${day} ${punch["timeOut"]}`).getTime())) {
      alert("Time entry cannot come before any existing entries on the same day");
      return false;
  }
  
  return true;
}

//Day comparison function for sorting
compareDays = (day1Array, day2Array) => {
  if (day1Array["day"] < day2Array["day"])
  return -1;
  else if (day1Array["day"] === day2Array["day"])
  return 0;
  else if (day1Array["day"] > day2Array["day"])
  return 1;
};

//Check if day exists and add day if it doesn't
addDay = async (day) => {
    
  await this.fetchRequest(`${this.defaultURL}/punches`);
  const dayArray = this.ObjToArray(this.timeCardObj);
  
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
      
      const result = await this.fetchRequest(`${this.defaultURL}/days`, configSettings);
      
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

// Function to show action messages
showActionMessage = (message) => {
  this.cActionMessage.textContent = message;
}
//Convert Object to Array
ObjToArray = (obj) => {
  return Object.keys(obj).map(element => obj[element]);
}


//Convert Object to Array
ObjToArray = (obj) => {
  return Object.keys(obj).map(element => obj[element]);
}

  render() {
    const { day, timeIn, timeOut, punchHistory, showPunchHistory, actionMessage } = this.state;

    return (
      <div>
        <h1>Time Card</h1>
        <table>
          <tr>
            <td><label htmlFor="dayPunch">Day: </label></td>
            <td><input type="date" id="dayPunch" value={day} onChange={this.handleDayChange} /></td>
          </tr>
          <tr>
            <td><label htmlFor="timePunchIn">Enter Clock-In Time:</label></td>
            <td><input type="time" id="timePunchIn" value={timeIn} onChange={this.handleTimeInChange} /></td>
          </tr>
          <tr>
            <td><label htmlFor="timePunchOut">Enter Clock-Out Time:</label></td>
            <td><input type="time" id="timePunchOut" value={timeOut} onChange={this.handleTimeOutChange} /></td>
          </tr>
          <tr>
            <td><button id="btnShowHistory" className=""></button></td>
            <td><button id="btnSubmit" className="button">&nbsp; Submit&nbsp;</button></td>
          </tr>
        </table>
        <div id="punchHistory"></div>
        <div id="actionMessage" style={{ bottom: 0, position: "fixed", fontStyle: "italic" }}>
          {actionMessage}
        </div>
      </div>
    );
  }
}

export default TimeCardApp;


ReactDOM.render(
    <TimeCardApp />,
  document.getElementById('root')
  );
  
# My Time Card Tracker

My Time Card Tracker is a simple React application that allows users to track their working hours by clocking in and out. The application uses a local JSON database with JSON Server to store and retrieve user time card data.

## Features

* Record clock-in and clock-out times for different days.
* View and manage timecard history.
* Delete timecard entries when needed.

## Getting Started
To use this Timecard Tracker App:
1. Clone or download this repository to your local machine.
1. Navigate to the root folder of the project.
1. Open the index.html file in your web browser.
1. Launch the JSON Server with the following command:
```bash
json-server --watch db.json --routes routes.json --port 3000
```
Note: JSON Server can be installed using the following command:
```bash
npm install json-server
```

## How to Use
#### Enter Timecard Details:
1. Select the date from the date picker input.
1. Enter the clock-in and clock-out time in the appropriate input fields.

#### Submit Timecard:
Click the _**Submit**_ button to add the timecard entry

#### View Timecard History:
Click the _**Show History**_ button to view the timecard history.
* Timecard entries are displayed in a table format, sorted by day.
* You can delete individual timecard entries by clicking the _**Delete**_ button next to the entry.

## API Endpoints
The Timecard Tracking App provides the following API endpoints:
>* GET /timeCard/days: Retrieves the list of days with timecard entries.
>* GET /timeCard/days/:id: Retrieves the timecard entries for a specific day by its ID.
>* GET /timeCard/punches: Retrieves all timecard entries.
>* GET /timeCard/punches/:id: Retrieves a specific timecard entry by its ID.
>* POST /timeCard/days: Adds a new day with timecard entries.
>* POST /timeCard/punches: Adds a new timecard entry.
>* DELETE /timeCard/punches/:id: Deletes a timecard entry by its ID.

## Data Structure (db.json)
The timecard entries are stored in the db.json file, with the following structure:
```
{
  "punches": [
    // Array of timecard entries
    {
      "id": 1,
      "day": "2023-07-31",
      "timeIn": "02:02:00 AM",
      "timeOut": "05:02:00 AM"
    },
    // Additional timecard entries...
  ],
  "days": [
    // Array of days with timecard entries
    {
      "id": 1,
      "day": "2023-07-31"
    },
    // Additional days...
  ]
}
```
To restore the sample data in the _db.json_ file after it has been modified, you can copy the file content from the _db\_bkp.json_ file into the the _db.json_ file.

## Technologies Used
* HTML
* CSS
* JavaScript
* React
* JSON Server (local JSON database)

## Disclaimer
This is a simple timecard tracking app created for demonstration purposes. It uses a local JSON database and is intended for personal use or as a starting point for further development.

Note: The app may not persist data beyond the current session since it utilizes a local JSON database for simplicity. For production use, consider using a server with a persistent database.

## License
The MIT License (MIT)

Copyright (c) 2023 Karlmac Yerima

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
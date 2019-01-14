'use strict';

var url = "http://localhost:600";

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    console.log('initiated');
    tableau.extensions.initializeAsync().then(function () {
      // Since dataSource info is attached to the worksheet, we will perform
      // one async call per worksheet to get every dataSource used in this
      // dashboard.  This demonstrates the use of Promise.all to combine
      // promises together and wait for each of them to resolve.
      let dataSourceFetchPromises = [];

      // Maps dataSource id to dataSource so we can keep track of unique dataSources.
      let dashboardDataSources = {};

      let datasource = {}

      // To get dataSource info, first get the dashboard.
      const dashboard = tableau.extensions.dashboardContent.dashboard;

      const clusterButton = document.getElementById("cluster")
      clusterButton.addEventListener('click', function () {
        console.log('cluster clicked')
        fetch(url + "/cluster").then(x => {
          const figure = document.getElementById("figure")
          figure.src = "../fig.png?time=" + new Date();
        })
      });

      const outlierButton = document.getElementById("outlier")
      outlierButton.addEventListener('click', function () {
        console.log('outlier clicked')
        fetch(url + "/outlier").then(x => {
          const figure = document.getElementById("figure")
          figure.src = "../fig.png?time=" + new Date();
        })
      });

      const resetButton = document.getElementById("reset")
      resetButton.addEventListener('click', function () {
        console.log('reset clicked')
        fetch(url + "/reset").then(x => {
          const figure = document.getElementById("figure")
          figure.src = "../fig.png?time=" + new Date();
        })
      });

      const saveButton = document.getElementById("save")
      saveButton.addEventListener('click', function () {
        console.log('save clicked')
        fetch(url + "/save");

        datasource.then(x => x.forEach(
          y => y.refreshAsync().then(console.log('refreshed'))
        ))


      });

      // Then loop through each worksheet and get its dataSources, save promise for later.
      const worksheet = dashboard.worksheets[0]
      datasource = worksheet.getDataSourcesAsync();
      worksheet.getUnderlyingDataAsync().then(dataTable => {
        console.log("## datasource loaded")
        const db = dataTable.data
        const pro = db.reduce((sum, data) => {
          sum["x"].push(data[1].value)
          sum["y"].push(data[2].value)
          sum["cluster"].push(data[0].value)
          return sum
        }, { "x": [], "y": [], "cluster": [] })

        console.log(pro)
        fetch(url + "/initial", {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pro), // body data type must match "Content-Type" header
        })

        $('#data').innerHTML = dataTable;
      })

    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });
})();


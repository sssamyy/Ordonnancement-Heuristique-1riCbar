// Handle Task Table Generation
document.getElementById("generateTable").addEventListener("click", function () {
    const numTasks = parseInt(document.getElementById("num_tasks").value);
    const table = document.getElementById("taskTable");
    const tbody = table.querySelector("tbody");

    if (!numTasks || numTasks < 1) {
        alert("Please enter a valid number of tasks.");
        return;
    }

    tbody.innerHTML = ""; // Clear previous rows
    table.style.display = "table";

    for (let i = 1; i <= numTasks; i++) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>Task ${i}</td>
            <td><input type="number" class="form-control release-time" required></td>
            <td><input type="number" class="form-control processing-time" required></td>
        `;
        tbody.appendChild(row);
    }

    // Hide the "Generate Task Table" button and show the "Reset Table" button
    this.style.display = "none";
    document.getElementById("resetTable").style.display = "block";
});

// Handle Task Table Reset
document.getElementById("resetTable").addEventListener("click", function () {
    const table = document.getElementById("taskTable");
    table.querySelector("tbody").innerHTML = ""; // Clear table rows
    table.style.display = "none";

    // Show the "Generate Task Table" button again
    document.getElementById("generateTable").style.display = "block";

    // Hide the "Reset Table" button
    this.style.display = "none";
});


// Handle Form Submission for Schedule Calculation
document.getElementById("scheduleForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const releaseTimes = Array.from(document.querySelectorAll(".release-time"))
        .map(input => parseInt(input.value));
    const processingTimes = Array.from(document.querySelectorAll(".processing-time"))
        .map(input => parseInt(input.value));

    if (releaseTimes.some(isNaN) || processingTimes.some(isNaN)) {
        alert("Please ensure all release times and processing times are filled correctly.");
        return;
    }

    const formData = new FormData();
    formData.append("num_tasks", releaseTimes.length);
    formData.append("release_times", releaseTimes.join(","));
    formData.append("processing_times", processingTimes.join(","));

    fetch("/calculate", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            const resultDiv = document.getElementById("result");
            const ganttChart = document.getElementById("ganttChart");
    
            if (data.error) {
                resultDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                ganttChart.style.display = "none";
            } else {
                let scheduleHtml = "<ul class='list-group'>";
                data.schedule.forEach((task) => {
                    scheduleHtml += `
                        <li class="list-group-item">
                            Task ${task.task}: Starts at ${task.start_time}, Duration: ${task.duration}
                        </li>`;
                });
                scheduleHtml += "</ul>";
    
                resultDiv.innerHTML = `
                    <div class="card mt-4 shadow-sm">
                        <div class="card-header bg-success text-white">
                            <h4>Results</h4>
                        </div>
                        <div class="card-body">
                            <h5>Schedule:</h5>${scheduleHtml}
                            <h5 class="mt-3">Average Completion Time: ${data.avg_time}</h5>
                        </div>
                    </div>
                `;
    
                // Fetch the Gantt chart
                fetch("/gantt", {
                    method: "POST",
                    body: formData,
                })
                    .then(response => response.blob())
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        ganttChart.src = url;
                        ganttChart.style.display = "block";
                        // Scroll to the result container
                        resultContainer.scrollIntoView({ behavior: "smooth" });
                    });
            }
            
        })
        .catch((error) => {
            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error}</div>`;
            // Scroll to the result container
            resultContainer.scrollIntoView({ behavior: "smooth" });
        });
    
});

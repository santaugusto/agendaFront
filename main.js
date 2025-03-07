document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");
    const prioritySelect = document.getElementById("prioritySelect");
    const dateInput = document.getElementById("taskDate");
    const currentDateDisplay = document.getElementById("currentDate");

    const weekViewBtn = document.getElementById("weekViewBtn");
    const weekModal = document.getElementById("weekModal");
    const weekTaskList = document.getElementById("weekTaskList");
    const prevWeekBtn = document.getElementById("prevWeek");
    const nextWeekBtn = document.getElementById("nextWeek");
    const closeModalBtn = document.getElementById("closeModal");

    let currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function updateCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateDisplay.textContent = now.toLocaleDateString('pt-BR', options);
    }

    updateCurrentDate();

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach(task => {
            const taskItem = document.createElement("div");
            taskItem.classList.add("p-4", "border-l-4", "rounded", "flex", "justify-between", "items-center");

            switch (task.priority) {
                case "alta":
                    taskItem.classList.add("bg-red-200", "border-red-600");
                    break;
                case "media":
                    taskItem.classList.add("bg-yellow-200", "border-yellow-600");
                    break;
                case "baixa":
                    taskItem.classList.add("bg-green-200", "border-green-600");
                    break;
            }

            taskItem.innerHTML = `
                <div>${task.text} - ${task.date} - ${task.priority}</div>
                <button class="deleteTask bg-red-500 text-white px-2 py-1 rounded">Deletar</button>
            `;

            taskItem.querySelector(".deleteTask").addEventListener("click", () => {
                tasks = tasks.filter(t => t !== task);
                localStorage.setItem("tasks", JSON.stringify(tasks));
                renderTasks();
            });

            taskList.appendChild(taskItem);
        });
    }

    addButton.addEventListener("click", () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const taskDate = dateInput.value;

        if (taskText === "" || taskDate === "") {
            alert("Preencha todos os campos!");
            return;
        }

        const newTask = { text: taskText, date: taskDate, priority };
        tasks.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();

        taskInput.value = "";
        dateInput.value = "";
    });

    function renderWeekTasks() {
        const start = new Date(currentWeekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        const filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= start && taskDate <= end;
        });

        weekTaskList.innerHTML = filteredTasks.length
            ? filteredTasks.map(task => `<div>${task.date} - ${task.text} (${task.priority})</div>`).join("")
            : "<p class='text-center'>Nenhuma tarefa nesta semana.</p>";
    }

    weekViewBtn.addEventListener("click", () => {
        renderWeekTasks();
        weekModal.classList.remove("hidden");
    });

    prevWeekBtn.addEventListener("click", () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeekTasks();
    });

    nextWeekBtn.addEventListener("click", () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeekTasks();
    });

    closeModalBtn.addEventListener("click", () => {
        weekModal.classList.add("hidden");
    });

    renderTasks();
});

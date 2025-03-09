document.addEventListener("DOMContentLoaded", () => {
    // Referências aos elementos
    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");
    const prioritySelect = document.getElementById("prioritySelect");
    const dateInput = document.getElementById("taskDate");
    const folderInput = document.getElementById("taskFolder");
    const currentDateDisplay = document.getElementById("currentDate");

    // Botões de visualização
    const todayViewBtn = document.getElementById("todayViewBtn");
    const weekViewBtn = document.getElementById("weekViewBtn");
    const monthViewBtn = document.getElementById("monthViewBtn");
    const folderViewBtn = document.getElementById("folderViewBtn");
    const calendarViewBtn = document.getElementById("calendarViewBtn");

    // Modal para a visualização semanal (já existente)
    const weekModal = document.getElementById("weekModal");
    const weekTaskList = document.getElementById("weekTaskList");
    const prevWeekBtn = document.getElementById("prevWeek");
    const nextWeekBtn = document.getElementById("nextWeek");
    const closeModalBtn = document.getElementById("closeModal");

    // Atualiza a data atual exibida na tela
    function updateCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateDisplay.textContent = now.toLocaleDateString('pt-BR', options);
    }
    updateCurrentDate();

    // Função para adicionar nova tarefa no back-end
    addButton.addEventListener("click", () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const taskDate = dateInput.value;
        // Se não informar pasta, define 'default'
        const folder = folderInput ? (folderInput.value.trim() || 'default') : 'default';

        if (taskText === "" || taskDate === "") {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const newTask = { text: taskText, date: taskDate, priority, folder };

        fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        })
        .then(response => response.json())
        .then(data => {
            // Após adicionar, recarrega a visualização ativa (aqui chamamos renderDefault, por exemplo)
            renderDefaultTasks();
            taskInput.value = "";
            dateInput.value = "";
            if (folderInput) folderInput.value = "";
        })
        .catch(error => console.error('Erro:', error));
    });

    // Função genérica para renderizar os itens (pode ser adaptada para cada visualização)
    function createTaskItem(task) {
        const taskItem = document.createElement("div");
        taskItem.classList.add("p-4", "border-l-4", "rounded", "flex", "justify-between", "items-center");

        // Define cor de fundo conforme prioridade
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

        const statusText = task.concluded ? "Concluída" : "Pendente";
        const toggleBtnText = task.concluded ? "Desmarcar" : "Marcar como Concluída";

        taskItem.innerHTML = `
            <div>
                ${task.text} - ${task.date} - ${task.priority} - Pasta: ${task.folder} - Status: ${statusText}
            </div>
            <div class="flex gap-2">
                <button class="toggleConcluded bg-green-500 text-white px-2 py-1 rounded" data-id="${task.id}">
                    ${toggleBtnText}
                </button>
                <button class="deleteTask bg-red-500 text-white px-2 py-1 rounded" data-id="${task.id}">
                    Deletar
                </button>
            </div>
        `;

        // Evento para deletar a tarefa
        taskItem.querySelector(".deleteTask").addEventListener("click", () => {
            const taskId = task.id;
            fetch(`http://localhost:3000/tasks/${taskId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(() => renderActiveView())
            .catch(error => console.error('Erro:', error));
        });

        // Evento para alternar status de conclusão
        taskItem.querySelector(".toggleConcluded").addEventListener("click", () => {
            const taskId = task.id;
            const newStatus = !task.concluded;
            fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concluded: newStatus })
            })
            .then(response => response.json())
            .then(() => renderActiveView())
            .catch(error => console.error('Erro:', error));
        });

        return taskItem;
    }

    // Variável para armazenar qual visualização está ativa
    let activeView = "default"; // "today", "folder", "calendar", etc.

    // Função para determinar qual função de renderização chamar
    function renderActiveView() {
        switch (activeView) {
            case "today":
                renderTodayTasks();
                break;
            case "folder":
                renderFolderView();
                break;
            case "calendar":
                renderCalendarView();
                break;
            default:
                renderDefaultTasks();
        }
    }

    // Visualização padrão: lista todas as tarefas (sem agrupamento)
    function renderDefaultTasks() {
        fetch('http://localhost:3000/tasks')
        .then(response => response.json())
        .then(tasks => {
            taskList.innerHTML = "";
            tasks.forEach(task => taskList.appendChild(createTaskItem(task)));
        })
        .catch(error => console.error('Erro:', error));
    }

    // Visualização de "Hoje": filtra tarefas cuja data seja igual à data atual
    function renderTodayTasks() {
        fetch('http://localhost:3000/tasks')
        .then(response => response.json())
        .then(tasks => {
            const today = new Date().toISOString().split('T')[0];
            const todayTasks = tasks.filter(task => task.date === today);
            taskList.innerHTML = "";
            if (todayTasks.length === 0) {
                taskList.innerHTML = "<p class='text-center'>Nenhuma tarefa para hoje.</p>";
                return;
            }
            todayTasks.forEach(task => taskList.appendChild(createTaskItem(task)));
        })
        .catch(error => console.error('Erro:', error));
    }

    // Visualização "Por Pasta": agrupa tarefas por pasta
    function renderFolderView() {
        fetch('http://localhost:3000/tasks')
        .then(response => response.json())
        .then(tasks => {
            // Agrupa tarefas por pasta
            const folders = {};
            tasks.forEach(task => {
                if (!folders[task.folder]) folders[task.folder] = [];
                folders[task.folder].push(task);
            });
            taskList.innerHTML = "";
            // Para cada pasta, cria uma seção
            for (const folder in folders) {
                const folderSection = document.createElement("div");
                folderSection.classList.add("mb-4", "folderSection");
                folderSection.innerHTML = `<h3 class="text-2xl font-bold mb-2 folderName">${folder}</h3>`;
                folders[folder].forEach(task => folderSection.appendChild(createTaskItem(task)));
                taskList.appendChild(folderSection);

                // Adiciona o evento de exibição das tarefas da pasta
                const folderName = folderSection.querySelector(".folderName");
                folderName.addEventListener("click", () => {
                    const isOpen = folderSection.classList.contains("open");
                    if (isOpen) {
                        folderSection.classList.remove("open");
                        folderSection.querySelectorAll(".taskItem").forEach(task => task.style.display = "none");
                    } else {
                        folderSection.classList.add("open");
                        folderSection.querySelectorAll(".taskItem").forEach(task => task.style.display = "block");
                    }
                });
            }
        })
        .catch(error => console.error('Erro:', error));
    }

    // Visualização "Calendário": agrupa tarefas por data (exibindo a data como cabeçalho)
    function renderCalendarView() {
        var calendarEl = document.getElementById('calendar');
      
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth', 
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          },
          events: function(fetchInfo, successCallback, failureCallback) {
            fetch('http://localhost:3000/tasks')
              .then(response => response.json())
              .then(tasks => {
                const events = tasks.map(task => {
                  return {
                    id: task.id,
                    title: task.text,
                    start: task.date, 
                    color: task.priority === 'alta' ? '#F87171' : 
                           task.priority === 'media' ? '#FACC15' : 
                           task.priority === 'baixa' ? '#86EFAC' : '#60A5FA',
                    extendedProps: {
                      folder: task.folder,
                      concluded: task.concluded
                    }
                  };
                });
                successCallback(events);
              })
              .catch(err => {
                console.error('Erro ao buscar tarefas:', err);
                failureCallback(err);
              });
          },
          eventDidMount: function(info) {
            var tooltipContent = `Pasta: ${info.event.extendedProps.folder} - Status: ${info.event.extendedProps.concluded ? 'Concluída' : 'Pendente'}`;
            info.el.setAttribute('title', tooltipContent);
          }
        });
      
        calendar.render();
      }
      

    // Eventos para alternar visualizações
    todayViewBtn.addEventListener("click", () => { activeView = "today"; renderActiveView(); });
    folderViewBtn.addEventListener("click", () => { activeView = "folder"; renderActiveView(); });
    calendarViewBtn.addEventListener("click", () => { activeView = "calendar"; renderActiveView(); });
    // Você pode manter os eventos para semana e mês conforme seu modal ou implementar funções similares.
    weekViewBtn.addEventListener("click", () => {
        // Exibe o modal da semana conforme seu código existente
        renderWeekTasks(); // se essa função já estiver implementada
        weekModal.classList.remove("hidden");
    });
    // (Eventos para prevWeek, nextWeek e fechar modal já existem abaixo)
    prevWeekBtn.addEventListener("click", () => { /* lógica para semana anterior */ });
    nextWeekBtn.addEventListener("click", () => { /* lógica para próxima semana */ });
    closeModalBtn.addEventListener("click", () => { weekModal.classList.add("hidden"); });

    // Renderiza a visualização padrão ao carregar a página
    renderActiveView();
});

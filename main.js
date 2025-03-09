document.addEventListener('DOMContentLoaded', function () {
    let tasks = []; // Variável global para armazenar as tarefas
    const addTaskButton = document.getElementById('addTaskButton');
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const taskFolder = document.getElementById('taskFolder');
    const prioritySelect = document.getElementById('prioritySelect');

    // Evento de clique no botão "Adicionar"
    addTaskButton.addEventListener('click', async () => {
        const text = taskInput.value.trim();
        const date = taskDate.value;
        const folder = taskFolder.value.trim();
        const priority = prioritySelect.value;

        // Verifica se os campos obrigatórios estão preenchidos
        if (!text || !date || !priority) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            // Fazendo a requisição POST para adicionar a tarefa
            const response = await fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    date,
                    priority,
                    folder,
                }),
            });

            // Verifica se a resposta foi bem-sucedida
            if (response.ok) {
                const newTask = await response.json();
                alert('Tarefa adicionada com sucesso!');
                console.log('Tarefa criada:', newTask);
                // Limpar os campos após a criação
                taskInput.value = '';
                taskDate.value = '';
                taskFolder.value = '';
                prioritySelect.value = 'alta';
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar a tarefa:', error);
            alert('Ocorreu um erro ao adicionar a tarefa.');
        }
    });

    // Função para buscar as tarefas e agrupar por pasta
    function fetchTasksAndGroupByFolder() {
        fetch('http://localhost:3000/tasks')
            .then(response => response.json())
            .then(fetchedTasks => {
                tasks = fetchedTasks; // Armazena as tarefas
                const folders = {};

                // Agrupar tarefas por pasta
                tasks.forEach(task => {
                    const folder = task.folder;
                    if (!folders[folder]) {
                        folders[folder] = [];
                    }
                    folders[folder].push(task);
                });

                // Exibir as pastas na barra lateral
                displayFolders(folders);
            })
            .catch(err => {
                console.error('Erro ao buscar tarefas:', err);
            });
    }

    // Função para exibir as pastas na barra lateral
    function displayFolders(folders) {
        const foldersContainer = document.getElementById('folders');
        foldersContainer.innerHTML = ''; // Limpa o conteúdo anterior

        // Criar um botão para cada pasta
        Object.keys(folders).forEach(folderName => {
            const folderButton = document.createElement('button');
            folderButton.classList.add('w-full', 'text-left', 'bg-indigo-500', 'px-4', 'py-2', 'rounded');
            folderButton.textContent = folderName;
            folderButton.addEventListener('click', () => {
                displayTasks(folders[folderName]); // Exibir as tarefas da pasta
            });

            foldersContainer.appendChild(folderButton);
        });
    }

    // Função para exibir as tarefas de uma pasta
    function displayTasks(tasksToDisplay) {
        const taskListContainer = document.getElementById('taskList');
        taskListContainer.innerHTML = ''; // Limpa as tarefas anteriores
    
        tasksToDisplay.forEach(task => {
            // Cria o container para a tarefa
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('bg-white', 'p-4', 'shadow', 'rounded-lg', 'flex', 'items-center', 'gap-4');
            taskDiv.dataset.taskId = task.id; // Adiciona o ID da tarefa no div
    
            // Cria o checkbox para marcar a tarefa como concluída
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('task-check');
            checkbox.dataset.taskId = task.id;
            checkbox.checked = task.concluded; // Marca a tarefa se estiver concluída
    
            // Cria o conteúdo da tarefa
            const taskContent = document.createElement('div');
            taskContent.classList.add('flex', 'flex-col');
            
            const taskTitle = document.createElement('h3');
            taskTitle.classList.add('text-xl', 'font-semibold');
            taskTitle.textContent = task.text;
    
            const taskDate = document.createElement('p');
            taskDate.classList.add('text-gray-600');
            taskDate.textContent = `Data: ${task.date}`;
    
            const taskPriority = document.createElement('p');
            taskPriority.classList.add('text-gray-600');
            taskPriority.textContent = `Prioridade: ${task.priority}`;
            
            // Cria o indicador de status de conclusão
            const statusIndicator = document.createElement('span');
            statusIndicator.classList.add('text-sm');
            statusIndicator.textContent = task.concluded ? 'Concluída' : 'Pendente';
            statusIndicator.classList.add(task.concluded ? 'text-green-600' : 'text-red-600');
            
            // Adiciona os elementos dentro do container da tarefa
            taskContent.appendChild(taskTitle);
            taskContent.appendChild(taskDate);
            taskContent.appendChild(taskPriority);
            taskContent.appendChild(statusIndicator); // Exibe o status da tarefa
            taskDiv.appendChild(checkbox);
            taskDiv.appendChild(taskContent);
            
            taskListContainer.appendChild(taskDiv);
    
            // Adiciona o evento para atualizar o status da tarefa
            checkbox.addEventListener('change', async (event) => {
                const taskId = event.target.dataset.taskId; // Obtém o ID da tarefa
                const isChecked = event.target.checked; // Verifica se a tarefa foi marcada como concluída
    
                try {
                    // Envia a requisição PATCH para atualizar o status da tarefa
                    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ concluded: isChecked }),
                    });
    
                    if (response.ok) {
                        const result = await response.json();
    
                        // Atualiza a interface com o novo status
                        const taskDiv = document.querySelector(`[data-task-id='${taskId}']`);
                        const statusIndicator = taskDiv.querySelector('span');
                        statusIndicator.textContent = isChecked ? 'Concluída' : 'Pendente';
                        statusIndicator.classList.remove(isChecked ? 'text-red-600' : 'text-green-600');
                        statusIndicator.classList.add(isChecked ? 'text-green-600' : 'text-red-600');
                    } else {
                        const errorData = await response.json();
                        console.error(`Erro: ${errorData.error}`);
                    }
                } catch (error) {
                    console.error('Erro ao atualizar o status da tarefa:', error);
                }
            });
        });
    }
    


    // Função para exibir ou esconder as exibições
    function toggleViews(viewToShow) {
        const views = ['todayView', 'weekView', 'monthView', 'calendarView'];
        views.forEach(view => {
            const viewElement = document.getElementById(view);
            if (view === viewToShow) {
                viewElement.style.display = 'block'; // Exibe a view selecionada
            } else {

                viewElement.style.display = 'none'; // Esconde as outras views
            }
        });
    }

    // Função para filtrar as tarefas de hoje
    function filterTasksByToday() {
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const tasksToday = tasks.filter(task => {
            return task.date.split('T')[0] === today; // Compara a data da tarefa com a data de hoje
        });
        displayTasks(tasksToday);
    }

    // Evento de clique no botão "Ver Tarefas de Hoje"
    const todayViewBtn = document.getElementById('todayViewBtn');
    todayViewBtn.addEventListener('click', function () {
        filterTasksByToday();
        toggleViews('todayView');
    });

    // Função para calcular o início e fim da semana atual
    function getWeekRange() {
        const currentDate = new Date();
        const startOfWeek = currentDate.getDate() - currentDate.getDay(); // Domingo (primeiro dia da semana)
        const endOfWeek = startOfWeek + 6; // Sábado (último dia da semana)

        const startDate = new Date(currentDate.setDate(startOfWeek));
        const endDate = new Date(currentDate.setDate(endOfWeek));

        // Ajuste no formato de data (YYYY-MM-DD)
        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    }

    // Função para filtrar as tarefas da semana atual
    function filterTasksByWeek() {
        const weekRange = getWeekRange(); // Obtém o intervalo da semana atual

        const tasksThisWeek = tasks.filter(task => {
            const taskDate = task.date.split('T')[0]; // Retira a parte do tempo da data
            return taskDate >= weekRange.start && taskDate <= weekRange.end;
        });

        displayTasks(tasksThisWeek); // Exibe as tarefas filtradas
    }

    // Eventos de clique
    const weekViewBtn = document.getElementById('weekViewBtn');
    weekViewBtn.addEventListener('click', function () {
        filterTasksByWeek();
        toggleViews('weekView');
    });

    function getMonthRange() {
        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1); // Primeiro dia do mês
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Último dia do mês
        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    }

    // Função para filtrar as tarefas do mês atual
    function filterTasksByMonth() {
        const monthRange = getMonthRange();
        const tasksThisMonth = tasks.filter(task => {
            const taskDate = task.date.split('T')[0]; // Remove a parte de tempo
            return taskDate >= monthRange.start && taskDate <= monthRange.end;
        });

        displayTasks(tasksThisMonth);
    }

    // Evento de clique no botão "Ver Tarefas do Mês"
    const monthViewBtn = document.getElementById('monthViewBtn');
    monthViewBtn.addEventListener('click', function () {
        filterTasksByMonth();
        toggleViews('monthView');
    });

    function renderCalendarView() {
        var calendarEl = document.getElementById('calendarView');

        var calendarView = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: function (fetchInfo, successCallback, failureCallback) {
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
            eventDidMount: function (info) {
                var tooltipContent = `Pasta: ${info.event.extendedProps.folder} - Status: ${info.event.extendedProps.concluded ? 'Concluída' : 'Pendente'}`;
                info.el.setAttribute('title', tooltipContent);
            }
        });

        calendarView.render();
    }

    const calendarViewBtn = document.getElementById('calendarViewBtn');
    calendarViewBtn.addEventListener('click', function () {
        renderCalendarView();
        // toggleViews('calendarView')
    });
    // Chama a função ao carregar a página
    fetchTasksAndGroupByFolder();
});

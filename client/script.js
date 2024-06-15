// Функция для отрисовки графа
function drawGraph(containerId, graph) {
    // Выбор контейнера и очистка его содержимого
    const container = d3.select(containerId);
    container.selectAll('*').remove();

    // Создание SVG внутри контейнера
    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', '100%');


    
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;

    // Настройка симуляции графа
    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2));

    // Преобразование графа в массивы узлов и ссылок
    const nodes = Object.keys(graph).map(key => ({ id: key }));
    const links = [];
    for (const key in graph) {
        graph[key].forEach(target => {
            links.push({ source: key, target: target.toString() });
        });
    }

    // Добавление маркера стрелки
    svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 22)// Подвигаем стрелку ближе к началу узла
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');

    //Добавление ссылок
    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', 'url(#arrow)')
        .attr('stroke-width', 4); // Увеличиваем толщину ребер
    

    // Добавление узлов
    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', 20) // Увеличиваем радиус кружков
        .attr('fill', 'blue')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    // Добавление текстовых меток для узлов
    const text = svg.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('dy', 5)
        .attr('dx', 0)
        .attr('fill', 'white')
        .attr('font-size', '16px') 
        .attr('font-weight', 'bold') 
        .attr('text-anchor', 'middle') // Центрируем текст внутри кружка
        .text(d => d.id);

    // Настройка симуляции
    simulation
        .nodes(nodes)
        .on('tick', ticked);

    simulation.force('link')
        .links(links);

    // Функция обновления позиций элементов на каждом шаге симуляции
    function ticked() {

        link
        .attr('x1', d => Math.max(20, Math.min(width - 20, d.source.x))) // ограничиваем x1
        .attr('y1', d => Math.max(20, Math.min(height - 20, d.source.y))) // ограничиваем y1
        .attr('x2', d => Math.max(20, Math.min(width - 20, d.target.x))) // ограничиваем x2
        .attr('y2', d => Math.max(20, Math.min(height - 20, d.target.y))); // ограничиваем y2

        node
            .attr('cx', d => Math.max(20, Math.min(width - 20, d.x))) // ограничиваем x
            .attr('cy', d => Math.max(20, Math.min(height - 20, d.y))); // ограничиваем y
    
        text
            .attr('x', d => Math.max(20, Math.min(width - 20, d.x))) // ограничиваем x
            .attr('y', d => Math.max(20, Math.min(height - 20, d.y))); // ограничиваем y
    }

    // Функции для обработки событий перетаскивания узлов
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Функция для запуска алгоритма
function runAlgorithm() {
    const graphInput = document.getElementById('graph-input').value;
    let graph;

    // Проверка корректности JSON формата
    try {
        graph = JSON.parse(graphInput);
    } catch (e) {
        alert('Invalid JSON format');
        return;
    }

    // Отрисовка исходного графа
    drawGraph('#input-graph', graph);

    // Отправка запроса на сервер для получения SCC
    fetch('http://localhost:3000/graph/scc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(graph)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Response from server:', data);
        // document.getElementById('scc-output').value = JSON.stringify(data, null, 2);

        // Вывод SCC построчно
        let output = '';
        data.forEach((component, index) => {
            output += 'SCC ' + (index + 1) + ':    ' + component.join(' ') + '\n';
        });
        document.getElementById('scc-output').value = output;
    
        const sccGraph = {};
        data.forEach((component, index) => {
            component.forEach(node => {
                if (!sccGraph[node]) sccGraph[node] = [];
                graph[node].forEach(target => {
                    if (component.includes(target)) {
                        sccGraph[node].push(target);
                    }
                });
            });
        });
        drawGraph('#scc-graph', sccGraph);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error processing the request. Check the console for more details.');
    });
}
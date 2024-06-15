import { Injectable } from '@nestjs/common';

@Injectable()
export class GraphService {
    // Метод для поиска сильносвязанных компонент в графе
    findStronglyConnectedComponents(graph: Record<number, number[]>): number[][] {
        let index = 0; // Инициализация индекса для вершин
        const stack = []; // Стек для хранения вершин
        const indices = new Map<number, number>(); // Словарь для хранения индексов обхода вершин 
        const lowLinks = new Map<number, number>(); // Словарь для хранения низких ссылок
        const result = []; // Массив для хранения результатов

        //Функция для обработки вершины - модифицированный DFS
        const strongConnect = (v: number) => {
            indices.set(v, index); // Устанавливаем индекс входа для вершины
            lowLinks.set(v, index); // Устанавливаем низкую ссылку для вершины
            index++; // Увеличиваем индекс
            stack.push(v); // Добавляем вершину в стек

            // Обрабатываем всех соседей вершины
            for (const w of graph[v]) {
                if (!indices.has(w)) { // Если сосед еще не обработан
                    strongConnect(w); // Рекурсивно обрабатываем соседа
                    lowLinks.set(v, Math.min(lowLinks.get(v), lowLinks.get(w))); // Обновляем низкую ссылку для текущей вершины v,
                    // то есть наименьший индекс, из которого можно попасть в v
                } else if (stack.includes(w)) { // Если сосед в стеке
                    lowLinks.set(v, Math.min(lowLinks.get(v), indices.get(w))); // Обновляем низкую ссылку для текущей вершины v
                }
            }

            // Если низкая ссылка совпадает с индексом, то это значит, что нет вершины с меньшим индексом, находящейся в стеке,
            // из которой модно попасть в данную вершину v  => эта вершина является корнем SCC и мы можем выделить компоненту сильной связности
            if (lowLinks.get(v) === indices.get(v)) {
                const component = [];
                let w;
                do {
                    w = stack.pop(); // Извлекаем вершину из стека
                    component.push(w); // Добавляем вершину в компоненту
                } while (v !== w);
                result.push(component); // Добавляем компоненту в результирующий массив
            }
        };

        // Обрабатываем все вершины графа
        for (const v in graph) {
            if (!indices.has(Number(v))) {
            strongConnect(Number(v)); // Если вершина еще не обработана, вызываем strongConnect
            }
        }

        return result; // Возвращаем результирующий массив компонент сильной связности 
    }
}

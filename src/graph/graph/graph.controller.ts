import { Controller, Post, Body } from '@nestjs/common';
import { GraphService } from './graph.service'; // Импортируем наш сервис GraphService

@Controller('graph') // Указываем, что этот контроллер будет обрабатывать маршруты, начинающиеся с 'graph'
export class GraphController {
    constructor(private readonly graphService: GraphService) {} // Инжектируем GraphService в контроллер

    @Post('scc') // Указываем, что этот метод будет обрабатывать POST-запросы на маршрут 'graph/scc'
    getSCC(@Body() graph: Record<number, number[]>) {
        // Метод для обработки запроса и возврата сильносвязанных компонент
        return this.graphService.findStronglyConnectedComponents(graph); // Вызываем метод сервиса для поиска SCC и возвращаем результат
        // return "Hello"
    }
}

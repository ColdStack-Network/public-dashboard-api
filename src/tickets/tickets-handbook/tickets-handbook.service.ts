import { Injectable } from '@nestjs/common';
import {
  HandbookTicketsReturned,
  TicketsTopicSubtopicObject,
} from './dto/ticket-topic.dto';

@Injectable()
export class TicketsHandbookService {
  getTicketsTopicSubtopic(): HandbookTicketsReturned[] {
    const allTopicsName = TicketsTopicSubtopicObject;
    const a = allTopicsName.map((x, i) => ({
      topic: { name: Object.keys(x)[0], id: i },
      subtopics: <{ name: string; id: number }[]>x[Object.keys(x)[0]],
    }));
    return a;
  }
}

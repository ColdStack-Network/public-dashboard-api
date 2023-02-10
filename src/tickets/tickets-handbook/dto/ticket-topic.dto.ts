import { ApiProperty } from '@nestjs/swagger';

class Topic {
  @ApiProperty({ type: 'string' })
  name: string;
  @ApiProperty({ type: 'number' })
  id: number;
}

export const TicketsTopicSubtopicObject = [
  {
    Billing: [
      { name: 'Deposit/withdraw delay', id: 2 },
      { name: 'Other', id: 3 },
    ],
  },
  {
    Storage: [
      { name: 'Upload problem', id: 4 },
      { name: 'Download problem', id: 5 },
      { name: 'Other', id: 6 },
    ],
  },
  {
    Other: [{ name: 'Other', id: 7 }],
  },
];

export class HandbookTicketsReturned {
  @ApiProperty({ type: () => Topic })
  topic: Topic;
  @ApiProperty({ type: () => Topic, isArray: true })
  subtopics: {
    name: string;
    id: number;
  }[];
}

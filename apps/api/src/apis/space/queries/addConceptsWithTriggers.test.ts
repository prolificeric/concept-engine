import { parseConcepts, parseConcept } from '@creatureco/concept-ml-parser';
import addConcepts from './addConcepts';
import { createTestContext } from '../../../lib/test-util';
import { Trigger } from '../../../lib/triggers';
import { SpaceResolverContext } from '../../../types';
import getAllConcepts from './getAllConcepts';
import {
  addConceptsWithTriggers,
  findTriggerMatchesForConcept,
} from './addConceptsWithTriggers';

describe('findTriggerMatchesForConcept', () => {
  let ctx: SpaceResolverContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  describe('given two triggers', () => {
    const givenTriggers = () => {
      const triggers: Trigger[] = [
        {
          name: 'trigger1',
          components: {
            matches: parseConcepts(
              `$person [Person, knows $topic (ProgrammingLanguage)]`,
            ),
            adds: [],
            removes: [],
            notifies: [],
          },
        },
        {
          name: 'trigger2',
          components: {
            matches: parseConcepts(
              `$topic [ProgrammingLanguage, for frontend-dev]`,
            ),
            adds: [],
            removes: [],
            notifies: [],
          },
        },
      ];

      return triggers;
    };

    describe('and concepts that partially fulfill them', () => {
      const givenConcepts = () => {
        return addConcepts(
          ctx.storage,
          parseConcepts(`
            js ProgrammingLanguage
            john-smith Person
          `),
        );
      };

      describe('when a new concept is tested for trigger matches', () => {
        test('then it should return the proper trigger match', async () => {
          const triggers = givenTriggers();
          await givenConcepts();

          const matches = await findTriggerMatchesForConcept({
            triggers,
            storage: ctx.storage,
            concept: parseConcept(`john-smith [knows js]`),
          });

          expect(matches).toMatchObject([
            {
              trigger: triggers[0],
              variables: {
                $person: parseConcept('john-smith'),
                $topic: parseConcept('js'),
              },
            },
          ]);
        });
      });
    });
  });
});

describe('addConceptsWithTriggers', () => {
  let ctx: SpaceResolverContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  // Concepts saved after triggers
  describe('given a saved trigger with @adds and partial matches', () => {
    const given = async () => {
      return addConceptsWithTriggers({
        ...ctx,
        concepts: parseConcepts(`
          trigger1 [
            @matches [
              $person [
                Person
                knows $topic
              ]
              $topic [
                ProgrammingLanguage
              ]
            ]
            @adds [
              $person Programmer
            ]
          ]

          {ts, js} ProgrammingLanguage
        `),
      });
    };

    describe('when a set of concepts are added that match it', () => {
      const when = async () => {
        return addConceptsWithTriggers({
          ...ctx,
          concepts: parseConcepts(`
            john-smith [
              Person
              knows {
                js
                ts
              }
            ]

            mary-martins [
              Person
              knows {
                ms-word
                ms-excel
              }
            ]
          `),
        });
      };

      test('then proper trigger changes should be created', async () => {
        await given();

        const result = await when();

        expect(result?.triggeredChanges.conceptsToAdd).toMatchObject(
          parseConcepts(`
            john-smith Programmer
          `),
        );
      });
    });
  });

  // Trigger saved after concepts
  describe('given a saved set of concepts', () => {
    const given = async () => {
      return addConceptsWithTriggers({
        ...ctx,
        concepts: parseConcepts(`
          john-smith [
            Person
            knows {js, ts} (ProgrammingLanguage)
          ]
        `),
      });
    };

    describe('when a trigger is added that matches some of the concepts', () => {
      const when = async () => {
        return addConceptsWithTriggers({
          ...ctx,
          concepts: parseConcepts(`
            programmerTrigger [
              @matches [
                $person [Person, knows $topic]
                $topic ProgrammingLanguage
              ]
              @adds [
                $person Programmer
              ]
            ]
          `),
        });
      };

      test('then proper trigger changes should be created', async () => {
        await given();
        await when();

        const allConcepts = await getAllConcepts(ctx.storage, {
          limit: 1000,
        });

        expect(allConcepts.some((c) => c.key === 'john-smith Programmer')).toBe(
          true,
        );
      });
    });
  });

  // Save concepts and triggers simultaneously
  describe('when matching concepts and triggers are added at the same time', () => {
    const when = async () => {
      return addConceptsWithTriggers({
        ...ctx,
        concepts: parseConcepts(`
            programmerTrigger [
              @matches [
                $person [Person, knows $topic]
                $topic ProgrammingLanguage
              ]
              @adds [
                $person Programmer
              ]
            ]

            john-smith [
              Person
              knows {js, ts} (ProgrammingLanguage)
            ]
          `),
      });
    };

    test('then proper trigger changes should be created', async () => {
      await when();

      const allConcepts = await getAllConcepts(ctx.storage, {
        limit: 1000,
      });

      expect(allConcepts.some((c) => c.key === 'john-smith Programmer')).toBe(
        true,
      );
    });
  });
});

describe('processTriggers', () => {
  describe('given a trigger with @notifies directive', () => {
    const given = () => {
      return [
        {
          name: 'trigger1',
          components: {
            matches: parseConcepts(
              `
                $person [
                  Person
                  knows $topic (ProgrammingLanguage)
                ]
              `,
            ),
            adds: [],
            removes: [],
            notifies: parseConcepts(`
              <<http://localhost>>
            `),
          },
        },
      ];
    };

    describe('when a pattern match is made', () => {
      const when = () => {
        return parseConcepts(`
          john-smith [
            Person
            knows ts (ProgrammingLanguage)
          ]
        `);
      };

      test('then it pings the specified URL', async () => {
        const ctx = await createTestContext();
        const triggers = given();
        const concepts = when();
        let result: any = {};

        await addConceptsWithTriggers({
          ...ctx,
          triggers,
          concepts,
          processNotification: async (notification) => {
            result = notification;
          },
        });

        expect(result).toMatchObject({
          url: 'http://localhost',
          trigger: triggers[0],
          variables: {
            $topic: { key: 'ts', parts: [] },
            $person: { key: 'john-smith', parts: [] },
          },
        });
      });
    });
  });
});

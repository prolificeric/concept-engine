import { Command } from 'commander';
import { parseConcepts } from '@creatureco/concept-ml-parser';

export default new Command()
  .name('add')
  .description('Parse and add concepts to a knowledge space.')
  .argument('<source...>', 'ConceptML source')
  .action((source: string[]) => {
    console.log(parseConcepts(source));
  });

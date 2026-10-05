import React from 'react';
import {defineFilm, THEMES, TitleCard, Head, Flow, Caption, Numbers, DecisionCard, Bars, EndCard} from '@kit/motion';

export default defineFilm({
  title: 'Orders · design',
  stamp: 'DESIGN',
  theme: {...THEMES.ink, accent: '#7CC4FA'},
  scenes: [
    {
      id: 'title',
      label: 'Orders',
      text: 'Orders, the design. One service, one queue, one table.',
      secs: 4,
      render: () => <TitleCard name="Orders, the design" why="One service, one queue, one table." />,
    },
    {
      id: 'flow',
      label: 'How it works',
      text: 'An order goes in, a worker charges it, the customer hears back',
      secs: 6,
      render: () => (
        <>
          <Head>How an order moves</Head>
          <Flow
            nodes={[
              {id: 'app', x: 330, y: 520, label: 'App', at: 0.3},
              {id: 'api', x: 760, y: 520, label: 'API', sub: 'writes the order', at: 0.9},
              {id: 'q', x: 1190, y: 520, label: 'Queue', at: 1.5, hot: true},
              {id: 'w', x: 1600, y: 520, label: 'Worker', sub: 'charges, retries', at: 2.1},
            ]}
            edges={[
              {a: 'app', b: 'api', at: 0.6, label: 'POST'},
              {a: 'api', b: 'q', at: 1.2, hot: true},
              {a: 'q', b: 'w', at: 1.8},
            ]}
          />
          <Caption at={2.6}>An order goes in, a worker charges it, the customer hears back.</Caption>
        </>
      ),
    },
    {
      id: 'numbers',
      label: 'In numbers',
      text: '3 parts 1 table 12 dollars a month',
      secs: 4,
      render: () => (
        <>
          <Head>What it costs</Head>
          <Numbers items={[{value: 3, label: 'parts'}, {value: 1, label: 'table'}, {value: 12, label: 'dollars a month', prefix: '$'}]} />
        </>
      ),
    },
    {
      id: 'decision',
      label: 'Decided for you',
      text: 'One queue, no event bus. A bus for every event. Simple now. Ready for ten consumers.',
      secs: 5,
      render: () => (
        <DecisionCard
          kicker="DECISION 1 OF 1 · VETO IF YOU WANT"
          picked={{label: 'PICKED', text: 'One queue, no event bus', then: 'Simple now.', thenLabel: 'WITH THIS'}}
          other={{label: 'ALTERNATIVE', text: 'A bus for every event', then: 'Ready for ten consumers.', thenLabel: 'WITH THAT'}}
        />
      ),
    },
    {
      id: 'time',
      label: 'Where the time goes',
      text: 'Charge 900 ms Write 40 ms Notify 120 ms',
      secs: 4,
      render: () => (
        <>
          <Head>Where the time goes</Head>
          <Bars items={[{label: 'Charge', value: 900, hot: true, tag: '900 ms'}, {label: 'Write', value: 40, tag: '40 ms'}, {label: 'Notify', value: 120, tag: '120 ms'}]} />
        </>
      ),
    },
    {id: 'end', text: 'Orders, the design. Your call: fine, adjust or veto.', render: () => <EndCard title="Orders, the design" line="Your call: fine, adjust or veto." />},
  ],
});

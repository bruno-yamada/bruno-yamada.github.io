import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Notes',
    Svg: require('@site/static/img/notes.svg').default,
    description: (
      <>
        Notes focused on labs, tools, runbooks, experimentations and more.
      </>
    ),
  },
  {
    title: 'Blog',
    Svg: require('@site/static/img/chat-bubble.svg').default,
    description: (
      <>
        Quick posts, thoughts, ideas, and more.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

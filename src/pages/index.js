import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Image from '@theme/IdealImage'

const features = [
  {
    title: 'Flexible and Extensible',
    description: (
      <>
        Simulations are defined programmatically with customizable components. 
      </>
    ),
  },
  {
    title: 'Interactive Graphical Simulations',
    description: (
      <>
      </>
    ),
  },
  {
    title: 'fasterer?',
    description: (
      <>
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <div>
            <img className={styles.heroLogo} src={useBaseUrl('img/logo.png')}></img>
          </div>
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section>
          <div className="container">
            <div className={clsx('row', styles.aboutRow)}>
              <div className="col">
                <h3>
                  Etomica has been developed at the University at Buffalo since 1999
                  for research and education.
                </h3>
                {/* <p>
                  It is modular in design, providing many choices for the simulation elements,
                  including: sampling algorithm; spatial dimension; molecular model (including both hard and soft potentials);
                  and properties for measurement. Simulation components are easily extended to develop new capabilities.
                </p> */}
              </div>
              <div className="col">
                {/* <Image img={require('@site/static/img/catalysis-demo.png')}/> */}
                <img src={useBaseUrl('/img/catalysis-demo.png')} className={styles.aboutImage}></img>
              </div>
            </div>
          </div>
        </section>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;

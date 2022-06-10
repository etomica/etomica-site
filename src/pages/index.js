import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Image from '@theme/IdealImage'

const areas = [
  {
    title: "Software",
    link: "/docs",
    description: `A framework written in Java to support object-oriented development of a wide variety of molecular simulations.`,
  },
  {
    title: "Modules",
    link: "/modules",
    description: `Interactive molecular simulations and tutorials that provide insight on how molecular behavior leads to
      thermodynamics, transport phenomena, and chemical reaction kinetics.`,
  },
  {
    title: "Apps",
    link: "/apps",
    description: `Useful web applications related to molecular modeling`
  },
  // {
  //   title: "Lessons",
  //   link: "/lessons",
  //   description: ` Lecture slides, reading material, and exercises relating
  //                     to molecular modeling and simulation`
  // },
];

const SiteArea = ({title, link, description}) => {
  return (
    <div className="col col--12">
      <Link to={link}>
        <h3>{title}</h3>
      </Link>
      <p>
        {description}
      </p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Etomica is a Java molecular simulation framework and a collection of resources for molecular modeling"
    >
      <main>
        <section>
          <div className="container">
            <div className={clsx("row", styles.aboutRow)}>
              <div className="col">
                <h3>
                  Etomica is a collection of resources for molecular modeling,
                  developed at the University at Buffalo.
                </h3>
                <h3>This is what you can find here:</h3>
                <div className="row">
                  {areas.map((props, idx) => (
                    <SiteArea key={idx} {...props} />
                  ))}
                </div>
              </div>
              <div className="col">
                <Image
                  className={styles.aboutImage}
                  img={require("/img/catalysis-demo.png")}
                />
                {/* <img src={useBaseUrl('/img/catalysis-demo.png')} className={styles.aboutImage}></img> */}
              </div>
            </div>
            <div className="row">
              <p className="col">
                Molecular modeling is concerned with understanding and
                evaluating material behavior using models for how molecules
                interact. A quantitative connection between molecular and
                macroscopic behaviors can be made rigorously using either
                molecular simulation, or calculation of virial coefficients.
                This site provides information and resources relating to both
                approaches.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;

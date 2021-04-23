
import React from 'react'
import mods from '../modules.json'
import Link from '@docusaurus/Link'
import styles from './ModuleIndex.module.css'
import clsx from 'clsx'

const ModuleCard = (props) => {
    return (
        <div className={clsx('card', styles.moduleCard)}>
            <div className='card__header'>
                <Link to={props.link}>
                    <h3>{props.title}</h3>
                </Link>
            </div>
            { props.thumb &&

                <div className={clsx('card__image', styles.moduleThumbSection)}>
                    <img src={`/img/module_thumbs/${props.thumb}`}></img>
                </div>
            }
            <div className="card__body">
                <p>
                    {props.desc}
                </p>
            </div>

        </div>
    )
}

export default () => {
    const items = mods.map((mod) => {
        return (
            <div className="col col--4" key={mod.title}>
                <ModuleCard link={`/modules/${mod.title}`} title={mod.title} desc={mod.description} thumb={mod.thumb} />
            </div>
        )
    })

    return (
        <div className="container">
            <div className="row">
                {items}
            </div>
        </div>
    )
}
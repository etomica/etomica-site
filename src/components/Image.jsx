import React from 'react';
import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl'

export default ({src, ...props}) => {
    if(process.env.NODE_ENV == 'production') {
        return (
            <Image img={src} {...props} />
        )
    } else {
        return (
            <img src={src.src.src} {...props}></img>
        )
    }
}
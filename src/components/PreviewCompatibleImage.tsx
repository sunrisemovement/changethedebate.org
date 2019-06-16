import React from 'react'
import Img, { GatsbyImageProps } from 'gatsby-image'

export type ImageResult = {
  childImageSharp: GatsbyImageProps
}

export type Props = {
  image: ImageResult | string,
  style?: React.CSSProperties
}

const PreviewCompatibleImage = ({ image, style }: Props) => {
  if (typeof image !== 'string' && typeof image === 'object') {
    return image.childImageSharp.fluid ?
      <Img style={style} fluid={image.childImageSharp.fluid} /> :
      <Img style={style} fixed={image.childImageSharp.fixed} />
  }

  if (typeof image === 'string') {
    return <img style={style} src={image} />
  }

  return null
}

export default PreviewCompatibleImage
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { graphql } from 'gatsby'
import BlockContent from '../components/block-content'
import Container from '../components/container'
import GraphQLErrorList from '../components/graphql-error-list'
import SEO from '../components/seo'
import Layout from '../containers/layout'
import { mapEdgesToNodes, filterOutDocsWithoutSlugs } from '../lib/helpers'

export const query = graphql`
  query ParticipatePageQuery {
    page: sanityPage(_id: { regex: "/(drafts.|)participate/" }) {
      id
      title
      _rawBody
    }
  }
`

const ParticipatePage = props => {
  const { data, errors } = props

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    )
  }

  const page = data && data.page

  if (!page) {
    throw new Error(
      'Missing "Participate" page data. Open the studio at http://localhost:3333 and add "Participate" page data and restart the development server.'
    )
  }

  return (
    <Layout>
      <SEO title={page.title} />
      <Container>
        <Styled.h1>{page.title}</Styled.h1>
        <BlockContent blocks={page._rawBody || []} />
      </Container>
    </Layout>
  )
}

export default ParticipatePage

import React from "react";
import { graphql } from "gatsby";
import Container from "../components/core/container";
import GraphQLErrorList from "../components/core/graphql-error-list";
import SEO from "../components/core/seo";
import Layout from "../containers/layout";
import ProfileBio from "../components/people-layouts/profile-bio.js"
import ProfileProjects from "../components/people-layouts/profile-projects";
import { mapEdgesToNodes, filterOutDocsWithoutSlugs } from "../lib/helpers";


export const query = graphql`
  query ProfileTemplateQuery($id: String!) {
    people: sanityPerson(id: { eq: $id }) {
      id
      image {
      asset {
          _id
      }
      }
      name
      _rawBio(resolveReferences: { maxDepth: 5 })
      slug {
        current
      }
      house
      position {
        title
        group
      }
      year
      concentration
    }
    project: allSanityProject(
        filter: { slug: { current: { ne: null } } }
        sort: { fields: [publishedAt], order: DESC }
    ) {
        edges {
            node {
                id
                publishedAt
                categories {
                    _id
                    title
                }
                subjects {
                    _id
                    title
                }
                mainImage {
                    crop {
                        _key
                        _type
                        top
                        bottom
                        left
                        right
                    }
                    hotspot {
                        _key
                        _type
                        x
                        y
                        height
                        width
                    }
                    asset {
                        _id
                    }
                    alt
                }
                title
                slug {
                    current
                }
                _rawExcerpt
                _rawMembers(resolveReferences: {maxDepth: 5})
            }
        }
    }
    blog: allSanityPost(
        filter: { slug: { current: { ne: null } } }
        sort: { fields: [publishedAt], order: DESC }
    ) {
        edges {
            node {
                id
                publishedAt
                categories {
                    _id
                    title
                }
                subjects {
                    _id
                    title
                }
                mainImage {
                    crop {
                    _key
                    _type
                    top
                    bottom
                    left
                    right
                    }
                    hotspot {
                    _key
                    _type
                    x
                    y
                    height
                    width
                    }
                    asset {
                    _id
                    }
                    alt
                }
                title
                slug {
                    current
                }
                _rawExcerpt
                _rawBody(resolveReferences: { maxDepth: 5 })
                authors {
                    _key
                    person {
                        id
                        image {
                            crop {
                                _key
                                _type
                                top
                                bottom
                                left
                                right
                            }
                            hotspot {
                                _key
                                _type
                                x
                                y
                                height
                                width
                            }
                            asset {
                                _id
                            }
                        }
                        name
                        slug {
                            current
                        }
                    }
                    roles
                }
            }
        }
    }
  }
`;

const ProfileTemplate = (props) => {
  const { data, errors } = props;
  const profile = data && data.people;
  const id = data && data.people && data.people.id;

  const projectNodes =
    data &&
    data.project &&
    mapEdgesToNodes(data.project).filter(filterOutDocsWithoutSlugs);

   const blogNodes =
    data &&
    data.blog &&
    mapEdgesToNodes(data.blog).filter(filterOutDocsWithoutSlugs);

  // Remove this and use a filter in the query when Sanity allows array filtering
  // Filter for project you contributed to
  const filteredProjectNodes = projectNodes.filter((node) => {
    let names = node._rawMembers
    let yourPresence = names.filter((name) => {
        return (name.person.id === id);
    })
    return yourPresence.length > 0;
  })

  const filteredBlogNodes = blogNodes.filter((node) => {
    let names = node.authors
    let yourPresence = names.filter((name) => {
        return (name.person.id === id);
    })
    return yourPresence.length > 0;
  })

  const contributionNodes = filteredProjectNodes.concat(filteredBlogNodes);

  return (
    <Layout>
        <br></br>
        <Container>
            {errors && <SEO title="GraphQL Error" />}
            {profile &&
                <SEO title={profile.name || "Unnamed Contributor"}/>
            }
            {errors && (
                <Container>
                <GraphQLErrorList errors={errors} />
                </Container>
            )}
            {profile && <ProfileBio data={profile}></ProfileBio>}
            {profile && <ProfileProjects data={profile} projects={contributionNodes}/>}
        </Container>
    </Layout>
  );
};

export default ProfileTemplate;
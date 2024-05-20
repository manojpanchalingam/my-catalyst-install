import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import { z } from 'zod';

import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_PRODUCT_FAQ_METAFIELDS_QUERY = graphql(
  `
    query getProductFaqMetafields($productId: Int!, $limit: Int, $after: String) {
      site {
        product(entityId: $productId) {
          metafields(namespace: "FAQ", first: $limit, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  `
);

const FaqMetafield = z.object({
  key: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const getProductFaqMetafields = cache(
  async (
    productId: number,
    limit: number,
    after?: string | null
  ) => {
    const response = await client.fetch({
      document: GET_PRODUCT_FAQ_METAFIELDS_QUERY,
      variables: {
        productId,
        limit,
        after,
      },
      fetchOptions: { next: { revalidate } },
    });

    const metafields = response.data.site.product?.metafields;

    if (!metafields) {
      return { endCursor: null, faqs: [] };
    }

    const fields = removeEdgesAndNodes(metafields);

    const faqs = fields
      .map((field) => {
        try {
          return FaqMetafield.parse({
            ...JSON.parse(field.value),
            key: field.key,
          });
        } catch (err) {
          return { key: '', question: '', answer: '' };
        }
      })
      .filter((field) => field.key.trim().length > 0);

    return {
      endCursor: metafields.pageInfo.hasNextPage ? metafields.pageInfo.endCursor : null,
      faqs,
    };
  },
);

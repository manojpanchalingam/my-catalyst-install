'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@bigcommerce/components/accordion';
import { Button } from '@bigcommerce/components/button';
import { Loader2 as Spinner } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

import { getProductFaqMetafields } from '~/client/queries/get-product-faq-metafields';
import getNextProductFaqs from './_actions/get-next-product-faqs';
const ProductFaqs = ({
  productId,
  limit,
  loadMoreLabel,
  faqData,
}: {
  productId: number;
  limit: number;
  loadMoreLabel: string;
  faqData: Awaited<ReturnType<typeof getProductFaqMetafields>>;
}) => {
  const [faqs, setFaqs] = useState(faqData.faqs);
  const [endCursor, setEndCursor] = useState(faqData.endCursor);
  const [pending, setPending] = useState(false);

  const getNextFaqs = async () => {
    setPending(true);

    try {
      const nextFaqData = await getNextProductFaqs(productId, limit, endCursor);

      setEndCursor(nextFaqData.endCursor);
      setFaqs(faqs.concat(nextFaqData.faqs));
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      toast.error(error);
    }

    setPending(false);
  };

  return (
    <>
      <Accordion type="multiple">
        {faqs.map((faq) => (
          <AccordionItem className="my-2 border border-gray-200 p-2"
            key={faq.key} value={faq.key}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {endCursor !== null && (
        <Button
          className="mx-auto block text-center md:w-2/3 lg:w-1/3"
          onClick={getNextFaqs}
          variant="secondary"
        >
          {pending ? (
            <Spinner aria-hidden="true" className="mx-auto animate-spin" />
          ) : (
            <span>{loadMoreLabel}</span>
          )}
        </Button>
      )}
    </>
  );
};
export default ProductFaqs;
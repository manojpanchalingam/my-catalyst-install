import { getProductFaqMetafields } from '~/client/queries/get-product-faq-metafields';
import ProductFaqs from '~/components/product-faqs';
import { getTranslations } from 'next-intl/server';
import { LocaleType } from '~/i18n';

const Faqs = async ({ productId, locale }: { productId: number, locale: LocaleType }) => {
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  await sleep(2000);

  const limit = 2;

  const faqData = await getProductFaqMetafields(productId, limit);
  const t = await getTranslations({ locale, namespace: "Product" });

  return <ProductFaqs 
    faqData={faqData} 
    limit={limit} 
    loadMoreLabel={t('FAQ.loadMore')}
    productId={productId}
  />;
};
export default Faqs;
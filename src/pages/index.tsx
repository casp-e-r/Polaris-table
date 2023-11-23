import apiClient from '@/apiClient';
import {
  ChoiceList,
  Card,
  Filters,
  Page,
  Tabs,
  IndexTable,
  Thumbnail,
  Modal,
  BlockStack,
  SkeletonTabs,
  SkeletonThumbnail,
  SkeletonBodyText,
  SkeletonDisplayText,
  Divider,
} from '@shopify/polaris';
import Image from 'next/image';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';

const randomInventory = () => {
  return Math.floor(Math.random() * (2500 - 0 + 1) + 0);
}

const statuses = ['active', 'draft', 'archive'];
const vendors = ['vendor 1', 'vendor 2', 'vendor 3'];
const availabilities = ['Online Store', 'Point of Sale', 'Buy Button'];
const salesType = ['indoor', 'outdoor'];

const randomString = (type: string) => {
  const arrayType = type == 'status' ? statuses : type == 'vendor' ? vendors : type == 'availability' ? availabilities : salesType;
  const randomValue = (array: string[]) => array[Math.floor(Math.random() * array?.length)];
  return randomValue(arrayType)
}

export default function FiltersWithADataTableExample() {
  const [availability, setAvailability] = useState<string[]>([]);
  const [productType, setProductType] = useState<string[]>([]);
  const [vendor, setVendor] = useState<string[]>([]);
  const [queryValue, setQueryValue] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const appliedFilters: any[] = [];

  const getProductsQuery = useQuery(
    ["getProducts"],
    async () => {
      const data = await apiClient.get(`/products`)
      return data?.data
    }
  );
  const getCategoriesQuery = useQuery(
    ["getCategories"],
    async () => {
      const data = await apiClient.get(`/products/categories`)
      return data?.data
    }
  );
  const getPrductByIdQuery = useQuery(
    ["getProductById", selectedProduct],
    async () => {
      const data = await apiClient.get(`/products/${selectedProduct}`)
      return data?.data
    },
    { enabled: !!selectedProduct }
  );

  const arrayOfProducts1 = useMemo(() => {
    const products = getProductsQuery?.data?.map((obj: any) => {
      return {
        id: obj?.id,
        category: obj?.category,
        imageUrl: obj?.image,
        title: obj?.title,
        status: randomString('status'),
        inventoryCount: randomInventory(),
        vendor: randomString('vendor'),
        salesType: randomString('type'),
        availability: randomString('availability'),
      }
    })
    setFilteredProducts(products)
    return products
  }, [getProductsQuery?.data])

  useEffect(() => {
    if (arrayOfProducts1) {
      let filteredArray = [...arrayOfProducts1];

      if (availability?.length > 0) {
        filteredArray = filteredArray?.filter((product) =>
          availability?.includes(product?.availability)
        );
      }
      if (vendor?.length > 0) {
        filteredArray = filteredArray?.filter((product) =>
          vendor?.includes(product?.vendor)
        );
      }
      if (productType?.length > 0) {
        filteredArray = filteredArray.filter((product) =>
          productType?.includes(product?.category)
        );
      }

      if (selectedTab !== 0) {
        filteredArray = filteredArray.filter((product) =>
          (selectedTab === 1 && product?.status === 'active') ||
          (selectedTab === 2 && product?.status === 'draft') ||
          (selectedTab === 3 && product?.status === 'archive')
        );
      }

      setFilteredProducts(filteredArray);
    }
  }, [availability, vendor, productType, arrayOfProducts1, selectedTab])

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelectedTab(selectedTabIndex),
    [],
  );

  const handleAvailabilityChange = useCallback(
    (value: string[]) => setAvailability(value),
    [],
  );
  const handleProductTypeChange = useCallback(
    (value: string[]) => setProductType(value),
    [],
  );
  const handleVendorChange = useCallback(
    (value: string[]) => {
      setVendor(value)
    },
    [],
  );
  const handleFiltersQueryChange = useCallback(
    (value: string) => {
      setQueryValue(value)
      // filter array
    },
    [],
  );
  const handleAvailabilityRemove = useCallback(() => setAvailability([]), []);
  const handleProductTypeRemove = useCallback(() => setProductType([]), []);
  const handleVendorRemove = useCallback(() => setVendor([]), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAvailabilityRemove();
    handleProductTypeRemove();
    handleVendorRemove();
    handleQueryValueRemove();
  }, [
    handleAvailabilityRemove,
    handleQueryValueRemove,
    handleProductTypeRemove,
    handleVendorRemove,
  ]);

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };
  const tabs = [
    {
      id: 'all-products',
      content: 'All',
      accessibilityLabel: 'All',
      panelID: 'all-customers-content-1',
    },
    {
      id: 'accepts-marketing-1',
      content: 'Active',
      panelID: 'accepts-marketing-content-1',
    },
    {
      id: 'repeat-customers-1',
      content: 'Draft',
      panelID: 'repeat-customers-content-1',
    },
    {
      id: 'prospects-1',
      content: 'Archieved',
      panelID: 'prospects-content-1',
    },
  ];

  const filters = [
    {
      key: 'availability',
      label: 'Availability',
      filter: (
        <ChoiceList
          title="Availability"
          titleHidden
          choices={availabilities?.map((dt: any) => {
            return { label: dt, value: dt }
          })}
          selected={availability || []}
          onChange={handleAvailabilityChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'productType',
      label: 'Product type',
      filter: (
        <ChoiceList
          title="Product type"
          titleHidden
          choices={getCategoriesQuery?.data?.map((dt: any) => {
            return { label: dt, value: dt }
          })}
          selected={productType || []}
          onChange={handleProductTypeChange}
          allowMultiple
        />
      ),
    },
    {
      key: 'vendor',
      label: 'Vendor',
      filter: (
        <ChoiceList
          title="Vendor"
          titleHidden
          choices={vendors?.map((dt: any) => {
            return { label: dt, value: dt }
          })}
          selected={vendor || []}
          onChange={handleVendorChange}
          allowMultiple
        />
      ),
    },
  ];

  if (!isEmpty(availability)) {
    const key = 'availability';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, availability),
      onRemove: handleAvailabilityRemove,
    });
  }
  if (!isEmpty(productType)) {
    const key = 'productType';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, productType),
      onRemove: handleProductTypeRemove,
    });
  }
  if (!isEmpty(vendor)) {
    const key = 'vendor';
    appliedFilters.push({
      key,
      label: `Available from ${vendor}`,
      onRemove: handleVendorRemove,
    });
  }

  const rowMarkup: JSX.Element[] = filteredProducts?.map(
    ({ id, imageUrl, title, status, inventoryCount, vendor, availability },
      index,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        onClick={() => setSelectedProduct(id)}
      >
        <IndexTable.Cell>
          <Thumbnail
            source={imageUrl}
            alt="Black choker necklace"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>{title?.length > 10 ? `${title.substring(0, 10)}...` : title}</IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
        <IndexTable.Cell>{inventoryCount}</IndexTable.Cell>
        <IndexTable.Cell>{vendor}</IndexTable.Cell>
        <IndexTable.Cell>{availability}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <div className='h-screen'>
      <Page title="Sales by product">
        <Card>
          <Modal
            title={getPrductByIdQuery?.data?.title}
            size='fullScreen'
            open={selectedProduct ? true : false} //modalOpen
            onClose={() => setSelectedProduct(null)} //setModalOpen(false)
          >
            <Modal.Section>
              <BlockStack>
                <div className='px-8 py-4'>
                  {getPrductByIdQuery?.isLoading ?
                    <div className='h-80 gap-y-2 w-full flex flex-col justify-between items-center'>
                      <SkeletonThumbnail size="large" />
                      <SkeletonBodyText />
                      <SkeletonBodyText />
                      <SkeletonBodyText />
                    </div>
                    : (
                    <BlockStack gap='500'>
                      <Image src={getPrductByIdQuery?.data?.image} alt={`${getPrductByIdQuery?.data?.tite} - Image`} width='200' height='200' className='flex mx-auto py-10' />
                      <Divider />
                      <div>
                        <h3 className='font-bold text-xl'>Description</h3>
                        <p>{getPrductByIdQuery?.data?.description}</p>
                      </div>
                      <Divider />
                      <BlockStack>
                        <div className='space-x-4'>
                          <span className='font-semibold text-md'>Rating :</span>
                          <span>{getPrductByIdQuery?.data?.rating?.rate}</span>
                        </div>
                        <div className='space-x-4'>
                          <span className='font-semibold text-md'>Rated By :</span>
                          <span>{getPrductByIdQuery?.data?.rating?.count}</span>
                        </div>
                      </BlockStack>
                    </BlockStack>
                    )
                  }

                </div>
              </BlockStack>
            </Modal.Section>
          </Modal>
          {getProductsQuery?.isLoading || getCategoriesQuery?.isLoading || !arrayOfProducts1 ?
            <div className="">
              <SkeletonTabs />
            </div>
            :
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <Filters
                queryValue={queryValue}
                queryPlaceholder="Search items"
                filters={filters}
                appliedFilters={appliedFilters}
                onQueryChange={handleFiltersQueryChange}
                onQueryClear={handleQueryValueRemove}
                onClearAll={handleFiltersClearAll}
              />
              <IndexTable
                resourceName={resourceName}
                itemCount={filteredProducts?.length || 0}
                headings={[
                  { title: ' ' },
                  { title: 'Product' },
                  { title: 'Status' },
                  { title: 'Inventory', },
                  { title: 'Type' },
                  { title: 'Vendor' },
                ]}
              >
                {rowMarkup}
              </IndexTable>
            </Tabs>}
        </Card>
      </Page>
    </div >
  );

  function disambiguateLabel(key: string, value: string[]): string {
    switch (key) {
      case 'vendor':
        return `Vendor By : ${value}`;
      case 'availability':
        return `Available On : ${value}`;
      case 'productType':
        return value.join(', ');
      default:
        return value.toString();
    }
  }

  function isEmpty(value: string | string[]): boolean {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }
}
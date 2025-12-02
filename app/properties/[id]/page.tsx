import PropertyDetailClient from '@/components/PropertyDetailClient';

interface Props {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: Props) {
  const propertyId = params.id; // pass to client component

  return <PropertyDetailClient propertyId={propertyId} />;

}
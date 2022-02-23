import { useRouter } from 'next/router';

export const useSpaceId = () => {
  const { spaceId } = useRouter().query;
  return spaceId ? decodeURIComponent(spaceId as string) : '';
};

export const useConceptId = () => {
  const { conceptId } = useRouter().query;
  return conceptId as string;
};

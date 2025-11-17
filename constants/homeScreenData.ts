// data.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';

/* -------------------------------------------------------------------------- */
/*  Type definitions – only the fields you actually store in Firestore      */
/* -------------------------------------------------------------------------- */

interface PhoneNumber {
  name: string;
  number: string;
}

interface BaseCard {
  title: string;
  description: string;
  image: string;          // URL that comes from Firebase Storage
  menu?: string;
  link?: string;
  info?: string;
  CampusSafetyphoneNumbers?: PhoneNumber[];
  HealthServicesPhoneNumbers?: PhoneNumber[];
}

/* Each collection has its own shape – no `tags` anywhere */
type FeaturedCard = BaseCard;                              // featuredEvents
type NewsCard      = BaseCard & { menu?: string };        // latestNews
type DiningCard    = BaseCard & { menu?: string };        // dining
type ExploreCard   = BaseCard & {
  link?: string;
  info?: string;
  CampusSafetyphoneNumbers?: PhoneNumber[];
  HealthServicesPhoneNumbers?: PhoneNumber[];
};                                                        // explore

/* -------------------------------------------------------------------------- */
/*  Generic helper – fetches a whole collection and normalises the image   */
/* -------------------------------------------------------------------------- */
async function fetchCollection<T extends BaseCard>(
  collectionName: string
): Promise<T[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => {
      const data = doc.data() as T;
      return {
        ...data,
        image: data.image ?? '', // guarantee a string
      } as T;
    });
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Public API – returns everything your app needs in one call             */
/* -------------------------------------------------------------------------- */
export default async function getCampusData() {
  const [
    featured,
    news,
    dining,
    explore,
  ] = await Promise.all([
    fetchCollection<FeaturedCard>('featuredEvents'),
    fetchCollection<NewsCard>('latestNews'),
    fetchCollection<DiningCard>('whereToEat'),
    fetchCollection<ExploreCard>('explore'),
  ]);

  return { featured, news, dining, explore };
}

/* Export the helper if you ever need it elsewhere */
export { fetchCollection };
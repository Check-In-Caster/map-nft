'use client';

import AppleMap from '@/components/home/map';
import NFTCard from '@/components/home/nft-card';
import Search from '@/components/home/search';
import { Properties } from '@/types/property';
import { PT_Serif } from 'next/font/google';
import { useState } from 'react';

interface HeroSectionProps {
  mapToken: string;
  defaultProperty: Properties[number];
}

const ptSerif = PT_Serif({ weight: '700', subsets: ['latin'] });

const HeroSection: React.FC<HeroSectionProps> = ({
  mapToken,
  defaultProperty,
}) => {
  const [selectedProperty, setSelectedProperty] = useState({
    ...defaultProperty,
    excluded: false,
  });

  return (
    <>
      <div className='p-2 md:p-0'>
        <h1
          className={`${ptSerif.className} text-[#FF5C00] font-medium text-7xl text-stroke mt-8 mb-5 text-center`}
        >
          Own Onchain Property!
        </h1>

        <h2 className='text-center text-xl font-sans tracking-tight mt-6 mb-8'>
          Own Property NFTs, the onchain version of famous places like Eiffel
          Tower to your favorite local cafe! <br /> Owning Property NFTs unlock
          ephemeral games to play! Read more{' '}
          <a
            href='https://checkin.gitbook.io/checkin-litepaper-v0.1/gameplay/onchain-property'
            className=' underline'
            target='_blank'
            rel='noreferrer'
          >
            here
          </a>
        </h2>

        <Search setLocation={setSelectedProperty} />
      </div>

      <div className='mt-4 flex w-full max-w-7xl items-center justify-between mx-auto mb-8 sm:mb-12'>
        <div className='block sm:grid place-content-center md:grid-cols-12 my-5 w-full'>
          <div className='col-span-8 lg:col-span-9 grid place-items-center pr-10'>
            <AppleMap
              token={mapToken}
              coordinates={
                selectedProperty.Locations?.coordinates as {
                  lat: number;
                  lng: number;
                }
              }
            />
          </div>
          <div className='col-span-4 lg:col-span-3 w-full'>
            <NFTCard
              key={selectedProperty.property_id}
              property_id={selectedProperty.property_id!}
              token_id={selectedProperty.token_id!}
              title={selectedProperty?.Locations?.location ?? ''}
              location={selectedProperty?.country ?? ''}
              score={
                selectedProperty?.score
                  ? Number(selectedProperty?.score)
                  : undefined
              }
              rating={selectedProperty?.Locations?.rating ?? 0}
              ratingCount={
                selectedProperty?.ratings
                  ? Number(selectedProperty?.ratings)
                  : 0
              }
              buttonText='Mint'
              imgUrl={selectedProperty.Locations?.image as string}
              flipBackDetails={{
                country: selectedProperty?.Locations?.country ?? '',
                type: selectedProperty?.Locations?.category ?? '',
                address: selectedProperty?.Locations?.location ?? '',
                code: '',
                coordinates: `{${
                  (
                    selectedProperty?.Locations?.coordinates as {
                      lat: string;
                    }
                  )?.lat
                } , ${
                  (
                    selectedProperty?.Locations?.coordinates as {
                      lng: string;
                    }
                  )?.lng
                }}`,
                id: '',
                edition: `${selectedProperty?.total_minted ?? '0'}/1000`,
              }}
              type={selectedProperty.type ?? ''}
              isExcluded={selectedProperty.excluded}
            />
            <div className='flex justify-center'>
              <button
                className='bg-[#bbb] opacity-70 max-w-[320px] cursor-not-allowed text-[#000] border border-gray-900 py-2 mt-2 px-5 w-full'
                disabled
              >
                Launch location coin 🔜
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;

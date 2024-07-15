/* eslint-disable @next/next/no-img-element */
import { DOMAIN } from '@/config';
import { prisma } from '@/lib/prisma';
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prop1 = searchParams.get('p1') || '';
  const prop2 = searchParams.get('p2') || '';
  const prop3 = searchParams.get('p3') || '';

  if (prop1 && prop2 && prop3) {
    try {
      const locations = await prisma.propertyInfo.findMany({
        where: {
          property_id: {
            in: [prop1, prop2, prop3],
          },
        },
        select: {
          total_minted: true,
          reviews: true,
          Locations: {
            select: {
              location: true,
              city: true,
              country: true,
              image: true,
              rating: true,
            },
          },
        },
      });

      if (locations) {
        const colors = ['bg-[#BAE1EB]', 'bg-[#C8B6E8]', 'bg-[#D9E8B6]'];

        const fontData = await fetch(
          new URL(`${DOMAIN}/assets/fonts/coolvetica.otf`, import.meta.url)
        ).then((res) => res.arrayBuffer());

        const imageResponse = new ImageResponse(
          (
            <div tw='flex flex-col w-full h-full relative'>
              <img
                src={`${DOMAIN}/assets/images/map.png`}
                alt='logo'
                width={1000}
                height={1000}
                tw='w-full h-full absolute z-1 top-0 left-0 object-cover'
              />
              <div tw='flex w-full h-44 p-12 justify-between items-center bg-opacity-60 bg-white relative z-10'>
                <div tw='flex flex-col'>
                  <h1 tw='text-4xl'>Mint Onchain Properties 🏠💰</h1>
                  <p tw='text-xl -mt-3'>Base Onchain Summer · Zora Free Mint</p>
                </div>
                <div tw='flex'>
                  <img
                    src={`${DOMAIN}/assets/images/logo.svg`}
                    alt='logo'
                    width={180}
                    height={52}
                  />
                </div>
              </div>
              <div tw='flex justify-center items-center mt-5'>
                {locations.map((location, index) => (
                  <div
                    key={index}
                    tw={`flex flex-col border ${colors[index]} border-gray-900 p-4 mx-5 w-[300px] h-[400px]`}
                  >
                    <div tw='flex flex-col w-full'>
                      <div tw='flex flex-col z-1'>
                        <div tw='flex flex-col relative'>
                          {location.Locations?.image && (
                            <img
                              src={
                                location.Locations?.image ||
                                'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                              }
                              alt=''
                              tw='w-full h-64 object-cover border border-gray-900'
                            />
                          )}
                          <div tw='flex justify-center items-center absolute rounded-full w-10 h-10 bg-white top-3 right-3 z-20'>
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div tw='flex flex-col h-26'>
                      <h3 tw='font-medium text-xl mt-5'>
                        {location.Locations?.location ?? ''}
                      </h3>
                      <p tw='font-medium my-2 text-sm'>
                        {location.Locations?.city &&
                        location.Locations.city.length > 25
                          ? ''
                          : `${location.Locations?.city},`}
                        {location.Locations?.country ?? ''}
                      </p>
                      <p tw='flex items-center space-x-2 mt-6'>
                        {location.Locations?.rating &&
                          Array(Math.round(location.Locations?.rating))
                            .fill(0)
                            .map((_, index) => (
                              <img
                                key={index}
                                src={`${DOMAIN}/assets/icons/star.svg`}
                                alt='star'
                                tw='w-5 h-5 inline-block'
                              />
                            ))}
                        {location.reviews && Number(location.reviews) > 0 && (
                          <span tw='ml-2'>{`(${location?.reviews})`}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 630,
            headers: {
              'Cache-Control': 'public, max-age=86400, immutable',
            },
            fonts: [
              {
                name: 'Coolvetica',
                data: fontData,
                style: 'normal',
              },
            ],
          }
        );

        imageResponse.headers.set('Cache-Control', 'public, max-age=86400');

        return imageResponse;
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }

  return new ImageResponse(
    (
      <div tw='flex flex-col w-full h-full bg-blue-400 relative'>
        <h1>Invalid NFT_Ids</h1>
      </div>
    )
  );
}

/* eslint-disable @next/next/no-img-element */
import { DOMAIN } from '@/config';
import { prisma } from '@/lib/prisma';
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const property_id = searchParams.get('l_id') || '';

  if (property_id) {
    try {
      const location = await prisma.propertyInfo.findUnique({
        where: {
          property_id: property_id,
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
              coordinates: true,
              category: true,
            },
          },
        },
      });

      console.log(location);

      // console.log(`${DOMAIN}/assets/fonts/coolvetica.otf`);

      if (location) {
        const fontData = await fetch(
          new URL(`${DOMAIN}/assets/fonts/coolvetica.otf`, import.meta.url)
        ).then((res) => res.arrayBuffer());

        const imageResponse = new ImageResponse(
          (
            <div
              tw='flex flex-col w-full h-full bg-blue-400 relative'
              style={{
                fontFamily: 'Coolvetica',
              }}
            >
              <img
                src={`${DOMAIN}/assets/images/map.png`}
                alt='logo'
                width={1000}
                height={1000}
                tw='absolute z-1 top-0 left-0 object-contain'
              />
              <div tw='flex w-full h-44 p-12 px-8 justify-between items-center bg-opacity-60 bg-white'>
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
              <div tw='flex justify-center items-center mt-24 relative'>
                <div
                  tw='flex flex-col border bg-[#EF9854] border-gray-900 p-4 mx-5 w-[300px] h-[400px] absolute right-40 top-9'
                  style={{
                    transform: 'rotate(30deg)',
                  }}
                >
                  <div tw='flex flex-col w-full'>
                    <div tw='flex flex-col z-1'>
                      <div tw='flex flex-col flex-wrap bg-black w-full h-64 text-white p-5 pt-7 text-sm relative'>
                        <p tw='leading-tight -mt-3'>
                          {location.Locations?.country ?? ''}
                        </p>
                        <p tw='leading-tight -mt-4'>
                          {location.Locations?.category ?? ''}
                        </p>
                        <p tw='leading-tight -mt-4'>
                          {location.Locations?.location ?? ''}
                        </p>
                        {/* <p tw='leading-tight -mt-3'>{location.address}</p>
                        <p tw='leading-tight -mt-3'>{location.code}</p> */}
                        <p tw='leading-tight -mt-3 text-wrap'>
                          {/* @ts-ignore */}
                          {`{${location.Locations?.coordinates.lat},`}
                        </p>
                        <p tw='leading-tight -mt-4'>
                          {/* @ts-ignore */}
                          {`${location.Locations?.coordinates.lng}}`}
                        </p>{' '}
                        {/* <p tw='leading-tight -mt-2'>{location.id}</p> */}
                        <p tw='absolute right-5 bottom-1'>
                          {`${location.total_minted ?? 0}/1000`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div tw='flex flex-col border bg-[#EF9854] border-gray-900 p-4 mx-5 w-[300px] h-[400px] -ml-40'>
                  <div tw='flex flex-col w-full'>
                    <div tw='flex flex-col z-1'>
                      <div tw='flex flex-col relative'>
                        <img
                          src={
                            location.Locations?.image ||
                            'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                          }
                          alt=''
                          tw='w-full h-64 object-cover border border-gray-900'
                        />
                      </div>
                    </div>
                  </div>

                  <div tw='flex flex-col h-26'>
                    <h3 tw='font-medium text-xl mt-5'>
                      {location.Locations?.location &&
                      location.Locations.location.length > 25
                        ? location.Locations.location.substring(0, 25)
                        : location.Locations?.location}
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
              </div>
            </div>
          ),
          {
            width: 800,
            height: 800,
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

        imageResponse.headers.set(
          'Cache-Control',
          'public, max-age=86400, immutable'
        );

        return imageResponse;
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }

  return new ImageResponse(
    (
      <div tw='flex flex-col w-full h-full bg-blue-400 relative'>
        <h1>Invalid NFT_Id</h1>
      </div>
    )
  );
}

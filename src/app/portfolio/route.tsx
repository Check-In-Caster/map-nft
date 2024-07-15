import { DOMAIN } from '@/config';
import { Button } from 'frames.js/next';
import { frames } from '../mint/frames';
import { prisma } from '@/lib/prisma';

const handler = frames(async (ctx) => {
  const { wallet_address } = ctx.searchParams;
  const buttonIndex = ctx?.message?.buttonIndex ?? 0;

  if (wallet_address.length !== 42) {
    return {
      image: (
        <div tw='bg-yellow-100 w-full h-full flex items-center justify-center'>
          please use a valid wallet address
        </div>
      ),
      buttons: [
        <Button
          action='post'
          target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
          key='1'
        >
          See More
        </Button>,
        <Button action='link' target={`${DOMAIN}`} key='2'>
          Mint
        </Button>,
      ],
      imageOptions: {
        aspectRatio: '1:1',
      },
      state: {
        first: true,
      },
    };
  }

  if (ctx.state && buttonIndex) {
    //first iteration
    //on first iteration fetch all the properties to pass to the state
    if (ctx?.state?.first === true && wallet_address) {
      const properties = await prisma.propertySales.findMany({
        where: {
          wallet_address,
        },
        select: {
          property_id: true,
        },
      });

      const startIndex = properties.length > 1 ? 1 : 0;

      if (properties) {
        return {
          image: `${DOMAIN}/api/image/mint?l_id=${properties[startIndex].property_id}`,
          buttons:
            startIndex !== properties.length - 1
              ? [
                  <Button
                    action='post'
                    target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
                    key='1'
                  >
                    {'<'}
                  </Button>,
                  <Button
                    action='post'
                    target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
                    key='2'
                  >
                    {'>'}
                  </Button>,
                  <Button
                    action='link'
                    target={`${DOMAIN}/?property=${properties[startIndex].property_id}&ref=${wallet_address}`}
                    key='3'
                  >
                    Mint
                  </Button>,
                ]
              : [
                  <Button
                    action='post'
                    target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
                    key='1'
                  >
                    {'<'}
                  </Button>,
                  <Button
                    action='link'
                    target={`${DOMAIN}/?property=${properties[startIndex].property_id}&ref=${wallet_address}`}
                    key='2'
                  >
                    Mint
                  </Button>,
                ],
          imageOptions: {
            aspectRatio: '1:1',
          },
          state: {
            first: false,
            properties,
            current: startIndex,
          },
        };
      }
    } else {
      //second iteration
      //here we'll have access to the properties array from the state and current index
      let { properties, current } = ctx.state;
      if (properties && current !== undefined) {
        current =
          current === properties.length - 1 && buttonIndex === 2
            ? current
            : current === 0 && buttonIndex === 1
            ? current
            : buttonIndex === 1
            ? current - 1
            : current + 1;

        return {
          image: `${DOMAIN}/api/image/mint?l_id=${properties[current].property_id}`,
          buttons:
            current !== properties.length - 1
              ? [
                  <Button
                    action='post'
                    target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
                    key='1'
                  >
                    {'<'}
                  </Button>,
                  <Button
                    action='post'
                    target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
                    key='2'
                  >
                    {'>'}
                  </Button>,
                  <Button
                    action='link'
                    target={`${DOMAIN}/?property=${properties[current].property_id}&ref=${wallet_address}`}
                    key='3'
                  >
                    Mint
                  </Button>,
                ]
              : [
                  <Button
                    action='post'
                    target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
                    key='1'
                  >
                    {'<'}
                  </Button>,
                  <Button
                    action='link'
                    target={`${DOMAIN}/?property=${properties[current].property_id}&ref=${wallet_address}`}
                    key='2'
                  >
                    Mint
                  </Button>,
                ],
          imageOptions: {
            aspectRatio: '1:1',
          },
          state: {
            first: false,
            properties,
            current,
          },
        };
      }
    }
  }

  try {
    //fetch any one property id
    const property = await prisma.propertySales.findFirst({
      where: {
        wallet_address,
      },
      select: {
        property_id: true,
      },
    });

    if (ctx.state === undefined && buttonIndex === 1) {
      return {
        image: `${DOMAIN}/api/image/mint?l_id=${property?.property_id}`,
        buttons: [
          <Button
            action='post'
            target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
            key='1'
          >
            {'>'}
          </Button>,
          <Button
            action='link'
            target={`${DOMAIN}/?property=${property?.property_id}&ref=${wallet_address}`}
            key='2'
          >
            Mint
          </Button>,
        ],
        imageOptions: {
          aspectRatio: '1:1',
        },
        state: {
          first: true,
        },
      };
    }

    return {
      image: `${DOMAIN}/api/image/mint?l_id=${property?.property_id}`,
      buttons: [
        <Button
          action='post'
          target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
          key='1'
        >
          See More
        </Button>,
        <Button
          action='link'
          target={`${DOMAIN}/?property=${property?.property_id}&ref=${wallet_address}`}
          key='2'
        >
          Mint
        </Button>,
      ],
      imageOptions: {
        aspectRatio: '1:1',
      },
      state: {
        first: true,
      },
    };
  } catch (error) {
    console.log(error);

    return {
      image: (
        <div tw='bg-yellow-100 w-full h-full flex items-center justify-center'>
          please use a valid wallet address
        </div>
      ),
      buttons: [
        <Button
          action='post'
          target={`${DOMAIN}/portfolio?wallet_address=${wallet_address}`}
          key='1'
        >
          See More
        </Button>,
        <Button action='link' target={`${DOMAIN}`} key='2'>
          Mint
        </Button>,
      ],
      imageOptions: {
        aspectRatio: '1:1',
      },
      state: {
        first: true,
      },
    };
  }
});

export const POST = handler;
export const GET = handler;

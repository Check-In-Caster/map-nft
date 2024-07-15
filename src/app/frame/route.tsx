import { DOMAIN } from '@/config';
import { Button } from 'frames.js/next';
import { frames } from '../mint/frames';

const handler = frames(async (ctx) => {
  const { property } = ctx.searchParams;

  return {
    image: `${DOMAIN}/api/image/mint?l_id=${property}`,
    buttons: [
      <Button action='link' target={`${DOMAIN}/?property=${property}`} key='1'>
        Mint
      </Button>,
      <Button action='link' target={`${DOMAIN}`} key='2'>
        Find more
      </Button>,
    ],
    imageOptions: {
      aspectRatio: '1:1',
    },
  };
});

export const POST = handler;
export const GET = handler;

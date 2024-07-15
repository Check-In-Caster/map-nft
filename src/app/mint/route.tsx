import { DOMAIN } from '@/config';
import { Button } from 'frames.js/next';
import { frames } from './frames';

const handler = frames(async (ctx) => {
  const { p1, p2, p3 } = ctx.searchParams;
  const buttonIndex = ctx.message?.buttonIndex || 0;
  const inputText = parseInt(ctx.message?.inputText || '') || null;

  console.log(ctx);

  if (buttonIndex === 1 && inputText && inputText >= 1 && inputText <= 3) {
    let p_id;
    if (inputText == 1) p_id = p1;
    else if (inputText == 2) p_id = p2;
    else p_id = p3;

    if (p_id) {
      return {
        image: `${DOMAIN}/api/image/mint?l_id=${p_id}`,
        buttons: [
          <Button
            action='link'
            target={`https://property.checkin.gg/?property=${p_id}`}
            key='1'
          >
            Mint
          </Button>,
          <Button
            action='post'
            target={`${DOMAIN}/mint?p1=${p1}&p2=${p2}&p3=${p3}`}
            key='2'
          >
            Check Trending
          </Button>,
          <Button action='link' target={`https://property.checkin.gg`} key='3'>
            Find more
          </Button>,
        ],
        imageOptions: {
          aspectRatio: '1:1',
        },
      };
    }
  }

  return {
    image: `${DOMAIN}/api/image/initial?p1=${p1}&p2=${p2}&p3=${p3}`,
    textInput: 'Input number of option to buy',
    buttons: [
      <Button
        action='post'
        target={`${DOMAIN}/mint?p1=${p1}&p2=${p2}&p3=${p3}`}
        key='1'
      >
        Mint
      </Button>,
      <Button action='link' target={`https://property.checkin.gg`} key='2'>
        Find more
      </Button>,
    ],
  };
});

export const POST = handler;
export const GET = handler;
